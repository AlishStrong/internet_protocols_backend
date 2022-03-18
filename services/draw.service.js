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

module.exports = {
  draw,
  undo,
  erase,
}
