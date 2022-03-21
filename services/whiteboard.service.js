const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const { WHITEBOARD_DOES_NOT_EXIST } = require('../utils/error.constants')

const whiteboardExists = async (id) => {
  const whiteboardId = new mongoose.Types.ObjectId(id)
  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  } else {
    return whiteboard
  }
}

const askHostToJoin = (userId, whiteboardId) => {
  console.log(`Host is notified about the request to join whiteboard ${whiteboardId} from user ${userId}`)
}

const notifyUserAboutRequest = (userId, whiteboardId, decision) => {
  console.log(`User ${userId} is notified about the ${decision ? 'positive' : 'negative'} decision to join whiteboard ${whiteboardId}`)
}

module.exports = {
  whiteboardExists,
  askHostToJoin,
  notifyUserAboutRequest
}
