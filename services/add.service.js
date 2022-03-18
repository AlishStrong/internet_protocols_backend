const addImage = async (elementId, whiteboardId, pos, image) => {
  console.log(whiteboardId)
  console.log(image)
  console.log(`Added image with ID: ${elementId} to the whiteboard, position is ${pos} .`)
}

const addImageComment = async (elementId, whiteboardId, comment) => {
  console.log(whiteboardId)
  console.log(`added comment ${comment} to image with ID: ${elementId},`)
}

module.exports = {
  addImage,
  addImageComment
}
