const whiteboardSessionRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

let session = {}

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const createNewWhiteboardSession = async (request, response, next) => {
  try {
    const body = request.body

    const hostId = Math.random().toString()
    const sessionId = Math.random().toString()

    session = {
      host: hostId,
      users: [
        {
          id: hostId,
          name: (body.creator && body.creator.name) ? body.creator.name : 'Session Host'
        }
      ],
      id: sessionId,
      name: (body.session && body.session.name) ? body.session.name : 'New whiteboard',
      elements: []
    }

    const forSessionToken = {
      hashedHostId: await bcrypt.hash(hostId, 11),
      hashedSessionId: await bcrypt.hash(sessionId, 11)
    }

    const sessionToken = jwt.sign(forSessionToken, process.env.SECRET)
    response
      .status(200)
      .send({ sessionToken })
  } catch (error) {
    next(error)
  }
}

const closeSession = async (request, response, next) => {
  try {
    const hostToken = getTokenFrom(request)
    const decodedHostToken = jwt.verify(hostToken, process.env.SECRET)
    const { hashedHostId, hashedSessionId } = decodedHostToken
    if (hashedHostId && hashedSessionId) {
      const hostCorrect = await bcrypt.compare(session.host, hashedHostId)
      const sessionCorrect = await bcrypt.compare(session.id, hashedSessionId)

      if (hostCorrect && sessionCorrect) {
        response.status(200).send({ message: 'Close session' })
      }

      if (!hostCorrect) {
        response.status(401).json({ error: 'wrong host' })
      }
      if (!sessionCorrect) {
        response.status(401).json({ error: 'wrong session' })
      }
    } else {
      response.status(401).json({ error: 'token missing or invalid' })
    }
  } catch (error) {
    next(error)
  }
}

whiteboardSessionRouter.post('/', createNewWhiteboardSession)
whiteboardSessionRouter.delete('/', closeSession)

module.exports = whiteboardSessionRouter
