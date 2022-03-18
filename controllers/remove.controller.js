const removeRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
const { removeObject, removeImageComment } = require('../services/remove.service')

const { WHITEBOARD_DOES_NOT_EXIST, REMOVAL_ERROR, ELEMENT_DOES_NOT_EXIST } = require('../utils/error.constants')

const removeElement = async (request, response) => {
  const elementId = new mongoose.Types.ObjectId(request.params.elementId)
  const whiteboardId = new mongoose.Types.ObjectId(request.params.whiteboardId)
  const actionId = request.params.actionId

  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)

  const element = await Element.findById(elementId)
  if (!element) throw new Error(ELEMENT_DOES_NOT_EXIST)


  const elementList = whiteboard.elements

  switch(actionId) {

    case 8:{
      // not sure if this check is necessary or if the Element.findById check is enough
      if (elementList.find(e => e === element)) {
        // dummy func
        removeObject(elementId)
        return response.status(200).send(`Note with ID: ${request.params.elementId} has been removed.`)
      } else {
        throw new Error(REMOVAL_ERROR)
      }
    }
    case 10:{
      if (elementList.find(e => e === element)) {
        // dummy func
        removeObject(elementId)
        return response.status(200).send(`Image with ID: ${request.params.elementId} has been removed.`)
      } else {
        throw new Error(REMOVAL_ERROR)
      }
    }
    case 12:{
      if (elementList.find(e => e === element)) {
        // dummy func
        removeImageComment(elementId)
        return response.status(200).send(`Comment removed from image with ID: ${request.params.elementId}.`)
      } else {
        throw new Error(REMOVAL_ERROR)
      }
    }
    default:
      console.log('wrong actionID')
  }
}

removeRouter.post('/', removeElement)

module.exports = removeRouter
