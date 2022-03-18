const mongoose = require('mongoose')

const pointSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  erasing: Boolean,
  mode: String,
})
const drawSchema = new mongoose.Schema({
  whiteboardId: { type: mongoose.Types.ObjectId, required: true },
  userId: {type: mongoose.Types.ObjectId},
  strokes: {
    type: [[pointSchema]],
  },
})

const Draw = mongoose.model('Draw', drawSchema)

module.exports = Draw
