const express = require('express')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const initialRouter = require('./controllers/initial')
const app = express()
const port = 3000

// Add preprocessing middleware here
app.use(express.json())

// Add Routes here
app.use(config.INITIAL_PATH, initialRouter)

// Add postprocessing middleware here
app.use(middleware.unknownEndpoint)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
