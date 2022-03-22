const { default: mongoose } = require('mongoose')
const Draw = require('../models/draw.model')
const { DRAWING_DOES_NOT_EXIST } = require('../utils/error.constants')

const draw = async (userId, whiteboardId) => {
  console.log(`User ${userId} has drawn on the whiteboard ${whiteboardId}`)
  return true
}

const undo = async (userId, whiteboardId) => {
  console.log(`User ${userId} has undone a draw operation the whiteboard ${whiteboardId}`)
  return true
}

const erase = async (userId, whiteboardId) => {
  console.log(`User ${userId} has erased on the whiteboard ${whiteboardId}`)
  return true
}

const drawingExists = async (id) => {
  const whiteboardId = new mongoose.Types.ObjectId(id)
  const drawing = await Draw.findOne({ whiteboardId: whiteboardId })
  if (!drawing) {
    throw new Error(DRAWING_DOES_NOT_EXIST)
  } else {
    return drawing
  }
}

module.exports = {
  draw,
  undo,
  erase,
  drawingExists
}
