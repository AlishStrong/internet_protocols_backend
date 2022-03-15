const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  response.status(400).json({ error: 'Something went wrong' })
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}
