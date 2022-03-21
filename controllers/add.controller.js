const addRouter = require('express').Router()
const mongoose = require('mongoose')
const Whiteboard = require('../models/whiteboard.model')
const Element = require('../models/element.model')
const { addElement } = require('../services/add.service')
const { WHITEBOARD_DOES_NOT_EXIST, UNKNOWN_ACTIONID, FAILED_CREATING_ELEMENT, UNKNOWN_ISSUE } = require('../utils/error.constants')


const addController = async (request, response) => {
  const body = request.body
  const whiteboardId = new mongoose.Types.ObjectId(body.whiteboardId)
  const actionId = body.actionId

  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) throw new Error(WHITEBOARD_DOES_NOT_EXIST)

  switch(actionId) {
    //Use Case 6&9: User adds an image/note to the whiteboard
    case 6:{
      const id = body.elementId
      const pos = body.pos
      const editState = body.editState
      let elementType = ''
      if(body.text){
        elementType = 'StickyNote'
      }else{
        elementType = 'Image'
      }
      const text = body.text
      const element = new Element({
        elementId: id,
        whiteboardId: whiteboardId,
        editState: editState,
        pos: pos,
        text: text,
        type: elementType
      })
      element.save().then(createdElement => {
        if(!createdElement._id){
          throw new Error(FAILED_CREATING_ELEMENT)
        }
        if(elementType === 'Stickynote'){
          addElement().then((res) => {
            response.status(200).send(res)
          }).catch((e) => {
            console.log(e)
            throw new Error(UNKNOWN_ISSUE)
          })
        }

      })
      break
    }
    default:
      throw new Error(UNKNOWN_ACTIONID)
  }
}

addRouter.post('/', addController)

module.exports = addRouter
