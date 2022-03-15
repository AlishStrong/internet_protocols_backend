const mongoose = require('mongoose')

const whiteboardSchema = new mongoose.Schema({
  host: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: false },
  password: { type: String, required: false },
  users: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }],
  elements: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Element'
  }]
})

const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema)

module.exports = Whiteboard
