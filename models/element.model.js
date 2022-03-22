const mongoose = require('mongoose')

const elementSchema = new mongoose.Schema({
  elementType: { type: String, required: true },
  elementId: { type: String, required: true },
  whiteboardId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Whiteboard',
    required: true
  },
  editState: { type: Boolean, required: true },
  currentUser: {
    type: String,
    required: true
  },
  pos: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }],
  text: { type: String, required: false },
  img:{
    data: { type: String, required: false },
    contentType: { type: String, required: false },
  },
  comments: [{ type: String, required: false }]
})

const Element = mongoose.model('Element', elementSchema)

module.exports = Element
