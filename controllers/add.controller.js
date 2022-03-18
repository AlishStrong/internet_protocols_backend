const addRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
const { addImage, addImageComment } = require('../services/add.service')

const { WHITEBOARD_DOES_NOT_EXIST, ELEMENT_DOES_NOT_EXIST, UNKNOWN_ACTIONID, ADD_ERROR } = require('../utils/error.constants')

const addController = async (request, response) => {
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
    //Use Case 9: User adds an image to the whiteboard
    case 9:{
      const pos = body.newPos
      const image = body.image
      addImage(elementId,whiteboardId,pos,image).then((res) => {
        response.status(200).send(res)
      }).catch((e) => {
        throw new Error(e)
      })
      break
    }
    //Use Case 11: User adds a comment to an image on the whiteboard
    case 11:{
      const comment = body.image
      if (elementList.find(e => e === element)) {
        addImageComment(elementId,whiteboardId,comment).then((res) => {
          response.status(200).send(res)
        }).catch((e) => {
          throw new Error(e)
        })
      } else {
        throw new Error(ADD_ERROR)
      }
      break
    }
    default:
      throw new Error(UNKNOWN_ACTIONID)
  }
}

addRouter.post('/', addController)

module.exports = addRouter
