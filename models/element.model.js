const mongoose = require('mongoose')

const elementSchema = new mongoose.Schema({
  elementType: { type: String, required: true },
  elementId: { type: String, required: true },
  whiteboardId: { type: Number, required: true },
  pos: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }],
  text: { type: String, required: false },
  img:{
    data: { type: Buffer, required: false },
    contentType: { type: String, required: false },
    comment: { type: String, required: false }
  }
})

const Element = mongoose.model('Element', elementSchema)

module.exports = Element
