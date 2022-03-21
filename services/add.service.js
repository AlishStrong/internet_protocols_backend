const addElement = async (elementId, whiteboardId, pos, image) => {
  console.log(whiteboardId)
  console.log(image)
  console.log(`Added image with ID: ${elementId} to the whiteboard, position is ${pos} .`)
}

module.exports = {
  addElement,
}
