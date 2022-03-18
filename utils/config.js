// Define endpoints paths here
const INITIAL_PATH = '/api/init'
const WHITEBOARD_SESSION_PATH = '/api/whiteboard'
const DRAW_PATH = '/api/draw'
const ELEMENT_ADD_PATH = '/api/element_add'
const ELEMENT_REMOVE_PATH = '/api/element_remove'
const ELEMENT_EDIT_PATH = '/api/element_edit'
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  INITIAL_PATH,
  WHITEBOARD_SESSION_PATH,
  DRAW_PATH,
  MONGODB_URI,
  ELEMENT_ADD_PATH,
  ELEMENT_REMOVE_PATH,
  ELEMENT_EDIT_PATH
}
