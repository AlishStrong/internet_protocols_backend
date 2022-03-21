const removeRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
//const { removeObject } = require('../services/remove.service')

const { WHITEBOARD_DOES_NOT_EXIST, REMOVAL_ERROR } = require('../utils/error.constants')

const removeController = async (request, response) => {
  const body = request.body
  const whiteboardId = new mongoose.Types.ObjectId(body.whiteboardId)
  const actionId = body.actionId

  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)


  switch(actionId) {
    //Use Case 8 & use Case 10: Remove image / sticky note from the whiteboard
    case 8:{
      const id = body.elementId
      Element.deleteOne({ elementId: id }, { whiteboardId: 1 }, function (err) {
        if (err) throw new Error(err)
        else response.status(200).send('Element removed succesfully, removed element ID:' + id)
      })
      break
    }
    default:
      throw new Error(REMOVAL_ERROR)
  }
}

removeRouter.post('/', removeController)

module.exports = removeRouter
