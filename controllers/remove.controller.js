const removeRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
const { removeObject, removeImageComment } = require('../services/remove.service')

const { WHITEBOARD_DOES_NOT_EXIST, REMOVAL_ERROR, ELEMENT_DOES_NOT_EXIST, UNKNOWN_ACTIONID } = require('../utils/error.constants')

const removeController = async (request, response) => {
  const body = request.body
  const elementId = new mongoose.Types.ObjectId(body.elementId)
  const whiteboardId = new mongoose.Types.ObjectId(body.whiteboardId)
  const actionId = body.actionId

  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)

  const element = await Element.findById(elementId)
  if (!element) throw new Error(ELEMENT_DOES_NOT_EXIST)


  const elementList = whiteboard.elements

  switch(actionId) {
    //Use Case 8 & use Case 10: Remove image / sticky note from the whiteboard
    case 8:{
      if (elementList.find(e => e === element)) {
        removeObject(elementId,whiteboardId).then((res) => {
          response.status(200).send(res)
        }).catch((e) => {
          throw new Error(e)
        })

      } else {
        throw new Error(REMOVAL_ERROR)
      }
      break
    }

    //Use Case 12: User removes a comment from the image on the whiteboard
    case 12:{
      if (elementList.find(e => e === element)) {
        removeImageComment(elementId,whiteboardId).then((res) => {
          response.status(200).send(res)
        }).catch((e) => {
          throw new Error(e)
        })
      } else {
        throw new Error(REMOVAL_ERROR)
      }
      break
    }
    default:
      throw new Error(UNKNOWN_ACTIONID)
  }
}

removeRouter.post('/', removeController)

module.exports = removeRouter
