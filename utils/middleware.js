const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  unknownEndpoint
}
