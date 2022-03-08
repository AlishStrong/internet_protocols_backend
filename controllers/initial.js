const initialRouter = require('express').Router()

const helloWorld = (req, res) => res.send('Hello World!')

initialRouter.get('/', helloWorld)

module.exports = initialRouter
