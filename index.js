require('dotenv').config()
const express = require('express')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const initialRouter = require('./controllers/initial')
const whiteboardSessionRouter = require('./controllers/whiteboardSessionController')
const app = express()
const port = 3000

// Add preprocessing middleware here
app.use(express.json())

// Add Routes here
app.use(config.INITIAL_PATH, initialRouter)
app.use(config.WHITEBOARD_SESSION_PATH, whiteboardSessionRouter)

// Add postprocessing middleware here
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
