const { WHITEBOARD_DOES_NOT_EXIST, UNAUTHORIZED, FAILED_CREATING_HOST, UNKNOWN_ISSUE, UNKNOWNENDPOINT, INCORRECT_PASSWORD } = require('./error.constants')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: UNKNOWNENDPOINT })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  switch (error.message) {
    case WHITEBOARD_DOES_NOT_EXIST:
      response.status(404).json({ error: WHITEBOARD_DOES_NOT_EXIST })
      break
    case UNAUTHORIZED:
      response.status(401).json({ error: UNAUTHORIZED })
      break
    case FAILED_CREATING_HOST:
      response.status(500).json({ error: FAILED_CREATING_HOST })
      break
    case INCORRECT_PASSWORD:
      response.status(401).json({ error: INCORRECT_PASSWORD })
      break
    default:
      response.status(500).json({ error: UNKNOWN_ISSUE })
      break
  }
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}
