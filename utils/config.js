// Define endpoints paths here
const INITIAL_PATH = '/api/init'
const WHITEBOARD_SESSION_PATH = '/api/whiteboard'
const ELEMENT_REMOVE_PATH = '/api/element_remove'
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  INITIAL_PATH,
  WHITEBOARD_SESSION_PATH,
  MONGODB_URI,
  ELEMENT_REMOVE_PATH
}
