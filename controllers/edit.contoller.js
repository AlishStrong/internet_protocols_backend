const editRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
const { WHITEBOARD_DOES_NOT_EXIST, UNKNOWN_ACTIONID, } = require('../utils/error.constants')


const editController = async (request, response) => {
  const body = request.body
  const whiteboardId = new mongoose.Types.ObjectId(body.whiteboardId)
  const actionId = body.actionId

  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)

  switch(actionId) {
    //20 is for editing a elements editState and current user
    case 20:{
      const id = body.elementId
      const editState = body.editState
      const currentUser = body.currentUser
      Element.findOneAndUpdate({ elementId: id, whiteboardId: 1 }, { editState: editState, currentUser: currentUser }, function (err) {
        if (err) throw new Error(err)
        else response.status(200).send('Element updated succesfully, updated element ID:' + id)
      })
      break
    }
    default:
      throw new Error(UNKNOWN_ACTIONID)
  }
}

editRouter.post('/', editController)

module.exports = editRouter
