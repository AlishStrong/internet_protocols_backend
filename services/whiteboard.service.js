const askHostToJoin = (userId, whiteboardId) => {
  console.log(`Host is notified about the request to join whiteboard ${whiteboardId} from user ${userId}`)
}

const notifyUserAboutRequest = (userId, whiteboardId, decision) => {
  console.log(`User ${userId} is notified about the ${decision ? 'positive' : 'negative'} decision to join whiteboard ${whiteboardId}`)
}

const leaveSession = (userId, whiteboardId) => {
  console.log(`User ${userId} is notified that he has left whiteboard ${whiteboardId}`)
}

const kickUser = (userId, whiteboardId) => {
  console.log(`Host is notified if user ${userId} was successfully kicked`)
}

module.exports = {
  askHostToJoin,
  notifyUserAboutRequest
}
