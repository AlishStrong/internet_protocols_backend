require('dotenv').config()
require('express-async-errors')
const mongoose = require('mongoose')
const express = require('express')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const whiteboardRouter = require('./controllers/whiteboard.controller')
const addRouter = require('./controllers/add.controller')
const removeRouter = require('./controllers/remove.controller')
const app = express()
const port = 3001
const cors = require('cors')
const editRouter = require('./controllers/edit.contoller')

// Connect to DB
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// Add CORS
app.use(cors())

// Add preprocessing middleware here
app.use(express.json())

// Add Routes here
app.use(config.WHITEBOARD_SESSION_PATH, whiteboardRouter)
app.use(config.ELEMENT_ADD_PATH, addRouter)
app.use(config.ELEMENT_REMOVE_PATH, removeRouter)
app.use(config.ELEMENT_EDIT_PATH, editRouter)



// Add postprocessing middleware here
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

app.listen(port, () => {
  console.log(`Backend app listening on port ${port}`)
})
