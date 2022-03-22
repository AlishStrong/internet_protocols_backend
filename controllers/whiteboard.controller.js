const whiteboardRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Whiteboard = require('../models/whiteboard.model')
const { WHITEBOARD_DOES_NOT_EXIST, FAILED_CREATING_HOST, UNAUTHORIZED, NAME_IS_MISSING, INCORRECT_PASSWORD, USER_IS_MISSING, DECISION_IS_MISSING, USER_DOES_NOT_EXIST, UNKNOWN_ISSUE } = require('../utils/error.constants')
const { askHostToJoin, notifyUserAboutRequest, whiteboardExists, notifyAboutClosure } = require('../services/whiteboard.service')
const { validateToken, validateRequest } = require('../services/auth.service')

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
      // Create Draw

    })
    .finally(() => response.status(200).send({ token, whiteboardId, hostId }))
}

const getWhiteboard = async (request, response) => {
  const whiteboard = await whiteboardExists(request.params.whiteboardId)
  const userList = whiteboard.users
  const { hashedUserId } = validateToken(request)
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

  const whiteboard = await whiteboardExists(request.params.whiteboardId)
  if ((whiteboard.password && !body.password) || (whiteboard.password !== body.password)) {
    throw new Error(INCORRECT_PASSWORD)
  }

  const user = new User({
    name: body.name
  })

  let userToken, userId

  user.save()
    .then(newUser => {
      const tokenBody = {
        hashedUserId: bcrypt.hashSync(newUser._id.toString(), parseInt(process.env.ROUNDS)),
        hashedSessionId: bcrypt.hashSync(whiteboard._id.toString(), parseInt(process.env.ROUNDS))
      }
      userToken = jwt.sign(tokenBody, process.env.SECRET)
      userId = newUser._id.toString()
      askHostToJoin(userId, whiteboard._id.toString())
    })
    .finally(() => response.status(200).json({ userToken, userId, message: 'Host has been notified about your request' }))
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

  const uId = new mongoose.Types.ObjectId(userId)

  const whiteboard = await whiteboardExists(whiteboardId)
  const user = await User.findById(uId)
  if (!user || !user._id) {
    throw new Error(USER_DOES_NOT_EXIST)
  }

  const { userCorrect: hostCorrect, sessionCorrect } = await validateRequest(request,
    { userId: whiteboard.host.toString(), whiteboardId: whiteboard._id.toString() })

  if (!hostCorrect) {
    throw new Error(UNAUTHORIZED)
  }
  if (!sessionCorrect) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }

  let result
  if (decision) {
    result = await Whiteboard.findByIdAndUpdate(whiteboard._id, { users: whiteboard.users.concat(uId) })
  } else {
    result = await User.findByIdAndDelete(uId)
  }

  if (result && result._id) {
    notifyUserAboutRequest(userId, whiteboardId, decision)
    return response.status(200).json({ message: `Request was ${decision ? 'approved' : 'declined'}` })
  } else {
    throw new Error(UNKNOWN_ISSUE)
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
  const whiteboardToClose = await whiteboardExists(request.params.whiteboardId)

  const { userCorrect: hostCorrect, sessionCorrect } = await validateRequest(request,
    { userId: whiteboardToClose.host.toString(), whiteboardId: whiteboardToClose._id.toString() })

  if (hostCorrect && sessionCorrect) {
    whiteboardToClose.users.forEach(async userId => {
      await User.deleteOne({ _id: userId })
    })
    await Whiteboard.deleteOne({ _id: whiteboardToClose._id })
    notifyAboutClosure(whiteboardToClose._id.toString())
    return response.status(200).send({ message: 'Whiteboard closed' })
  }

  if (!hostCorrect) {
    throw new Error(UNAUTHORIZED)
  }
  if (!sessionCorrect) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }
}

whiteboardRouter.post('/', createWhiteboard)
whiteboardRouter.get('/:whiteboardId', getWhiteboard)
whiteboardRouter.delete('/:whiteboardId', closeWhiteboard)
whiteboardRouter.post('/request-to-join/:whiteboardId', requestToJoin)
whiteboardRouter.post('/process-request-to-join', processRequest)
whiteboardRouter.get('/is-protected/:whiteboardId', isProtected)

module.exports = whiteboardRouter
