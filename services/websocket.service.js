// const whiteboardClientsGroup = {
//   clients: ['array of clientObj'],
//   whiteboardId: 'id of the whiteboard to notify only the right clients'

const { NOT_FOUND_MESSAGE, NOT_FOUND_CODE, UNAUTHORIZED_CODE, UNAUTHORIZED_MESSAGE } = require('../utils/websocket.errors')
const { validateWebSocketMessage } = require('./auth.service')

// }
const WhiteboardClientsGroup = class {
  constructor(whiteboardId, clients = []) {
    this.whiteboardId = whiteboardId
    this.clients = clients
  }
}

// const clientObj = {
//   ws: 'websocket client for sending messages back to frontend via ws.send("message")',
//   userId: 'user id for proper handling'
//   status: 'active' | 'host' | 'pending'
// }
const Client = class {
  constructor(ws, userId, status) {
    this.ws = ws
    this.userId = userId
    this.status = status
  }
}

// const ClientMessage = class {
//   constructor(token, userId, whiteboardId, status, messageType) {
//     this.token = token
//     this.userId = userId
//     this.whiteboardId = whiteboardId
//     this.status = status
//     this.messageType = 'connection'
//   }
// }

// const ResponseMessage = class {
//   constructor(userId, whiteboardId, status) {
//     this.userId = userId
//     this.whiteboardId = whiteboardId
//     this.status = status
//   }
// }

const processConnectionMessage = async (connectionMessage, clients, ws) => {
  const { token, status, userId, whiteboardId } = connectionMessage
  const valid = await validateWebSocketMessage(token, userId, whiteboardId)
  if (status && valid) {
    const clientsGroupExists = clients.find(wcg => wcg.whiteboardId === whiteboardId)
    if (clientsGroupExists) {
      const clientExists = clientsGroupExists.clients.find(c => c.status === status && c.userId === userId)

      if (clientExists) {
        clientsGroupExists.clients.map(c => {
          if (c.status === status && c.userId === userId) {
            c.ws = ws
          }
          return c
        })
      } else {
        switch (status) {
          case 'host':
            ws.close(UNAUTHORIZED_CODE, UNAUTHORIZED_MESSAGE) // client is trying to impersonate host. Terminate it
            break
          case 'pending': {
            // this is a pending user requesting to join whiteboard
            const newClient = new Client(ws, userId, status)
            clientsGroupExists.clients.push(newClient)
            // notify host about the pending user!
            const hostClient = clientsGroupExists.clients.find(c => c.status === 'host')
            if (hostClient && hostClient.ws) {
              console.log('processConnectionMessage notifying host about pending request')
              // send message to host with data about the pending user
              const messageObj = {
                userId,
                status,
                whiteboardId,
                messageType: 'joining'
              }
              hostClient.ws.send(JSON.stringify(messageObj))
            } else {
              ws.close(UNAUTHORIZED_CODE, UNAUTHORIZED_MESSAGE) // host is missing! Terminate it
            }
            break
          }
          default: {
            // this is a user accepted by host
            const newClient = new Client(ws, userId, status)
            clientsGroupExists.clients.push(newClient)
            break
          }
        }
      }

    } else {
      console.log('processConnectionMessage clientsGroupExists FALSE')
      if (status === 'host') {
        const hostClient = new Client(ws, userId, status)
        const newClientsGroup = new WhiteboardClientsGroup(whiteboardId, [hostClient])
        clients.push(newClientsGroup)
      } else {
        ws.close(NOT_FOUND_CODE, NOT_FOUND_MESSAGE) // client is trying to reach unexisting whiteboard. Terminate it
      }
    }
  }
}

const processMessageFromClient = async (msg, clientsArray, ws) => {

  const clientMessage = JSON.parse(msg)
  switch (clientMessage.messageType) {
    case 'connection':
      console.log('websocketService processMessage connection')
      await processConnectionMessage(clientMessage, clientsArray, ws)
      break

    default:
      console.log('websocketService processMessage unknown')
      break
  }

  clientsArray.forEach(ws => {
    console.log('websocketService processMessage client', ws)
  })
}

const websocketService = {
  clients: [], // type WhiteboardClientsGroup[]
  sendMessage: function(message) {
    console.log('websocketService sendMessage message', message)
  },
  processMessage: async function(msg, ws) {
    await processMessageFromClient(msg, this.clients, ws)
  }
}

module.exports = websocketService
