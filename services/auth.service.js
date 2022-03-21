const { UNAUTHORIZED } = require('../utils/error.constants')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  } else {
    throw new Error(UNAUTHORIZED)
  }
}

const validateToken = (request) => {
  try {
    const userToken = getTokenFrom(request)
    return jwt.verify(userToken, process.env.SECRET)
  } catch (error) {
    throw new Error(UNAUTHORIZED)
  }
}

const validateRequest = async (request, { userId, whiteboardId }) => {
  try {
    const { hashedUserId, hashedSessionId } = validateToken(request)
    let userCorrect, sessionCorrect
    if (userId && hashedUserId) {
      userCorrect = await bcrypt.compare(userId.toString(), hashedUserId)
    }
    if (whiteboardId && hashedSessionId) {
      sessionCorrect = await bcrypt.compare(whiteboardId.toString(), hashedSessionId)
    }

    return { userCorrect, sessionCorrect }
  } catch (error) {
    throw new Error(UNAUTHORIZED)
  }
}

module.exports = {
  validateToken,
  validateRequest
}
