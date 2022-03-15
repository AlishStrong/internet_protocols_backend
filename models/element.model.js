const mongoose = require('mongoose')

const elementSchema = new mongoose.Schema({
  type: { type: String, required: true },
  coordinates: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }]
})

const Element = mongoose.model('Element', elementSchema)

module.exports = Element
