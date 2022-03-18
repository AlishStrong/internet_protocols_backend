const mongoose = require('mongoose')

const elementSchema = new mongoose.Schema({
  type: { type: String, required: true },
  coordinates: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }],
  stickyNoteText: { type: String, required: false },
  img:{
    data: { type: Buffer, required: false },
    contentType: { type: String, required: false },
    comment: { type: String, required: false }
  }
})

const Element = mongoose.model('Element', elementSchema)

module.exports = Element
