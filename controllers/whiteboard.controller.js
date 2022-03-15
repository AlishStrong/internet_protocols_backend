const whiteboardRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Whiteboard = require('../models/whiteboard.model')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const createWhiteboard = async (request, response) => {
  const body = request.body

  const hostName = body.creator ?? 'Session Host'
  const user = new User({
    name: hostName
  })

  let hostId, whiteboardId, token

  user.save()
    .then(createdHost => {
      hostId = createdHost._id
      if (!hostId) {
        throw new Error('Failed creating the Host')
      }

      const whiteboard = new Whiteboard({
        host: hostId,
        name: (body.whiteboard && body.whiteboard.name) ?? 'New whiteboard',
        users: [hostId],
        elements: []
      })

      if (body.whiteboard && body.whiteboard.password) {
        whiteboard.password = bcrypt.hashSync(body.whiteboard.password, parseInt(process.env.ROUNDS))
      }

      return whiteboard.save()
    })
    .then(createdWhiteboard => {
      whiteboardId = createdWhiteboard._id
      const tokenBody = {
        hashedHostId: bcrypt.hashSync(hostId.toString(), parseInt(process.env.ROUNDS)),
        hashedSessionId: bcrypt.hashSync(whiteboardId.toString(), parseInt(process.env.ROUNDS))
      }
      token = jwt.sign(tokenBody, process.env.SECRET)
    })
    .catch(error => {
      console.log('Error while creating a host', error)
    })
    .finally(() => response.status(200).send({ token, whiteboardId }))
}

const closeWhiteboard = async (request, response) => {
  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const whiteboardToClose = await Whiteboard.findById(whiteboardId)

  if (!whiteboardToClose || !whiteboardToClose._id) {
    console.log(`Whiteboard ${whiteboardId} does not exist`)
    return response.status(400).json({ error: 'Whiteboard does not exist!' })
  }

  const hostToken = getTokenFrom(request)
  const { hashedHostId, hashedSessionId } = jwt.verify(hostToken, process.env.SECRET)

  if (hashedHostId && hashedSessionId) {
    const hostCorrect = await bcrypt.compare(whiteboardToClose.host.toString(), hashedHostId)
    const sessionCorrect = await bcrypt.compare(whiteboardToClose._id.toString(), hashedSessionId)

    if (hostCorrect && sessionCorrect) {
      whiteboardToClose.users.forEach(async userId => {
        await User.deleteOne({ _id: userId })
      })
      await Whiteboard.deleteOne({ _id: whiteboardToClose._id })
      return response.status(200).send({ message: 'Whiteboard closed' })
    }

    if (!hostCorrect) {
      return response.status(401).json({ error: 'Wrong host' })
    }
    if (!sessionCorrect) {
      return response.status(401).json({ error: 'Wrong whiteboard' })
    }
  } else {
    return response.status(401).json({ error: 'Token is missing or invalid' })
  }
}

whiteboardRouter.post('/', createWhiteboard)
whiteboardRouter.delete('/:whiteboardId', closeWhiteboard)

module.exports = whiteboardRouter
