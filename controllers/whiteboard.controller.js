const whiteboardRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Whiteboard = require('../models/whiteboard.model')
const { WHITEBOARD_DOES_NOT_EXIST, FAILED_CREATING_HOST, UNAUTHORIZED, NAME_IS_MISSING, INCORRECT_PASSWORD, USER_IS_MISSING, DECISION_IS_MISSING, USER_DOES_NOT_EXIST, UNKNOWN_ISSUE } = require('../utils/error.constants')
const { askHostToJoin, notifyUserAboutRequest } = require('../services/whiteboard.service')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  } else {
    throw new Error(UNAUTHORIZED)
  }
}

const createWhiteboard = async (request, response) => {
  const body = request.body

  const hostName = body.creator ? body.creator : 'Session Host'
  const user = new User({
    name: hostName
  })

  let hostId, whiteboardId, token

  user.save()
    .then(createdHost => {
      hostId = createdHost._id
      if (!hostId) {
        throw new Error(FAILED_CREATING_HOST)
      }

      const whiteboard = new Whiteboard({
        host: hostId,
        name: (body.whiteboard && body.whiteboard.name) ? body.whiteboard.name : 'New whiteboard',
        users: [hostId],
        elements: []
      })

      if (body.whiteboard && body.whiteboard.password) {
        whiteboard.password = body.whiteboard.password
      }

      return whiteboard.save()
    })
    .then(createdWhiteboard => {
      whiteboardId = createdWhiteboard._id
      const tokenBody = {
        hashedUserId: bcrypt.hashSync(hostId.toString(), parseInt(process.env.ROUNDS)),
        hashedSessionId: bcrypt.hashSync(whiteboardId.toString(), parseInt(process.env.ROUNDS))
      }
      token = jwt.sign(tokenBody, process.env.SECRET)
    })
    .catch(error => {
      console.log(FAILED_CREATING_HOST, error)
    })
    .finally(() => response.status(200).send({ token, whiteboardId, hostId }))
}

const getWhiteboard = async (request, response) => {
  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const whiteboard = await Whiteboard.findById(whiteboardId)

  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)

  const userList = whiteboard.users

  const userToken = getTokenFrom(request)
  const { hashedUserId } = jwt.verify(userToken, process.env.SECRET)
  const userFound = userList.find(user => bcrypt.compareSync(user.toString(), hashedUserId))
  if (userFound) {
    return response.status(200).json({ whiteboard })
  } else {
    throw new Error(UNAUTHORIZED)
  }
}

const requestToJoin = async (request, response) => {
  const body = request.body

  if (!body.name) {
    throw new Error(NAME_IS_MISSING)
  }

  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const whiteboard = await Whiteboard.findById(whiteboardId)

  if (!whiteboard) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }

  if ((whiteboard.password && !body.password) || (whiteboard.password !== body.password)) {
    throw new Error(INCORRECT_PASSWORD)
  }

  const user = new User({
    name: body.name
  })

  let userToken

  user.save()
    .then(newUser => {
      const tokenBody = {
        hashedUserId: bcrypt.hashSync(newUser._id.toString(), parseInt(process.env.ROUNDS)),
        hashedSessionId: bcrypt.hashSync(whiteboardId.toString(), parseInt(process.env.ROUNDS))
      }
      userToken = jwt.sign(tokenBody, process.env.SECRET)
      askHostToJoin(newUser._id.toString(), whiteboardId.toString())
    })
    .finally(() => response.status(200).json({ userToken, message: 'Host has been notified about your request' }))
}

const processRequest = async (request, response) => {
  const body = request.body
  const { whiteboardId, userId, decision } = body

  if (!whiteboardId) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }

  if (!userId) {
    throw new Error(USER_IS_MISSING)
  }

  if (typeof decision === 'undefined') {
    throw new Error(DECISION_IS_MISSING)
  }

  const wId = new mongoose.Types.ObjectId(whiteboardId)
  const uId = new mongoose.Types.ObjectId(userId)

  const whiteboard = await Whiteboard.findById(wId)
  const user = await User.findById(uId)

  if (!whiteboard || !whiteboard._id) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }

  if (!user || !user._id) {
    throw new Error(USER_DOES_NOT_EXIST)
  }

  const hostToken = getTokenFrom(request)
  const { hashedUserId, hashedSessionId } = jwt.verify(hostToken, process.env.SECRET)

  if (hashedUserId && hashedSessionId) {
    const hostCorrect = await bcrypt.compare(whiteboard.host.toString(), hashedUserId)
    const sessionCorrect = await bcrypt.compare(whiteboard._id.toString(), hashedSessionId)

    if (!hostCorrect) {
      throw new Error(UNAUTHORIZED)
    }
    if (!sessionCorrect) {
      throw new Error(WHITEBOARD_DOES_NOT_EXIST)
    }

    let result
    if (decision) {
      result = await Whiteboard.findByIdAndUpdate(wId, { users: whiteboard.users.concat(uId) })
    } else {
      result = await User.findByIdAndDelete(uId)
    }

    if (result && result._id) {
      notifyUserAboutRequest(userId, whiteboardId, decision)
      return response.status(200).json({ message: `Request was ${decision ? 'approved' : 'declined'}` })
    } else {
      throw new Error(UNKNOWN_ISSUE)
    }

  } else {
    throw new Error(UNAUTHORIZED)
  }
}

const isProtected = async (request, response) => {
  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (whiteboard) {
    if (whiteboard.password) {
      return response.status(200).json({ protected: true })
    } else {
      return response.status(200).json({ protected: false })
    }
  } else {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }
}

const closeWhiteboard = async (request, response) => {
  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const whiteboardToClose = await Whiteboard.findById(whiteboardId)

  if (!whiteboardToClose || !whiteboardToClose._id) {
    console.log(`Whiteboard ${whiteboardId} does not exist`)
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }

  const hostToken = getTokenFrom(request)
  const { hashedUserId, hashedSessionId } = jwt.verify(hostToken, process.env.SECRET)

  if (hashedUserId && hashedSessionId) {
    const hostCorrect = await bcrypt.compare(whiteboardToClose.host.toString(), hashedUserId)
    const sessionCorrect = await bcrypt.compare(whiteboardToClose._id.toString(), hashedSessionId)

    if (hostCorrect && sessionCorrect) {
      whiteboardToClose.users.forEach(async userId => {
        await User.deleteOne({ _id: userId })
      })
      await Whiteboard.deleteOne({ _id: whiteboardToClose._id })
      return response.status(200).send({ message: 'Whiteboard closed' })
    }

    if (!hostCorrect) {
      throw new Error(UNAUTHORIZED)
    }
    if (!sessionCorrect) {
      throw new Error(WHITEBOARD_DOES_NOT_EXIST)
    }
  } else {
    throw new Error(UNAUTHORIZED)
  }
}

whiteboardRouter.post('/', createWhiteboard)
whiteboardRouter.get('/:whiteboardId', getWhiteboard)
whiteboardRouter.delete('/:whiteboardId', closeWhiteboard)
whiteboardRouter.post('/request-to-join/:whiteboardId', requestToJoin)
whiteboardRouter.post('/process-request-to-join', processRequest)
whiteboardRouter.get('/is-protected/:whiteboardId', isProtected)

module.exports = whiteboardRouter
