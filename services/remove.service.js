const removeObject = async (elementId, whiteboardId) => {
  console.log(whiteboardId)
  console.log(`Remove the element with element ID: ${elementId} from the whiteboard elements.`)
}

const removeImageComment = async (elementId, whiteboardId) => {
  console.log(whiteboardId)
  console.log(`Remove the comment from image with ID: ${elementId},`)
}

module.exports = {
  removeObject,
  removeImageComment
}
