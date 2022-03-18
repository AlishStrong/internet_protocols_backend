const drawRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Whiteboard = require('../models/whiteboard.model')
const {
  WHITEBOARD_DOES_NOT_EXIST,
  UNAUTHORIZED,
  NAME_IS_MISSING,
  INCORRECT_PASSWORD,
  USER_IS_MISSING,
  USER_DOES_NOT_EXIST,
  UNKNOWN_ISSUE,
} = require('../utils/error.constants')
const { response } = require('express')
const { draw, undo, erase } = require('../services/draw.service')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  } else {
    throw new Error(UNAUTHORIZED)
  }
}

const drawController = async (request, response) => {
  const body = request.body
  const userId = new mongoose.Types.ObjectId(body.userId)
  if (!userId) {
    throw new Error(USER_IS_MISSING)
  }
  const user =  User.findById(userId)
  if (!user) {
    throw new Error(USER_DOES_NOT_EXIST)
  }
  const whiteboardId = new mongoose.Types.ObjectId(request.body.whiteboardId)
  const whiteboard = await Whiteboard.findById(whiteboardId)
  if (!whiteboard) {
    throw new Error(WHITEBOARD_DOES_NOT_EXIST)
  }
  switch (body.actionId) {
  case 13:
    draw(userId, whiteboardId)
    .then((res) => {
      response.status(200).send(res)
    })
    .catch((e) => {
        throw new Error(UNKNOWN_ISSUE)
      }
    )
    break
  case 17:
    undo(userId, whiteboardId)
    .then((res) => {
      response.status(200).send(res)
    })
    .catch((e) => {
      throw new Error(UNKNOWN_ISSUE)
    })
    break
  case 18:
    erase(userId, whiteboardId)
    .then((res) => {
      response.status(200).send(res)
    })
    .catch((e) => {
      throw new Error(UNKNOWN_ISSUE)
    })
    break
  default:
    throw new Error(UNKNOWN_ISSUE)
  }
}

drawRouter.post('/', drawController)

module.exports = drawRouter
