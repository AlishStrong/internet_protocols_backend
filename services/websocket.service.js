// const whiteboardClientsGroup = {
//   clients: ['array of clientObj'],
//   whiteboardId: 'id of the whiteboard to notify only the right clients'
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

const processConnectionMessage = (connectionMessage, clients, ws) => {
  const { token, status, userId, whiteboardId } = connectionMessage
  if (token && status && userId && whiteboardId) {
    const clientsGroupExists = clients.find(wcg => wcg.whiteboardId === whiteboardId)
    if (!clientsGroupExists && status === 'host') {
      const hostClient = new Client(ws, userId, status)
      const newClientsGroup = new WhiteboardClientsGroup(whiteboardId, [hostClient])
      clients.push(newClientsGroup)
    } else if (clientsGroupExists && status !== 'host') {
      console.log('Clients group already exists!', clients)
      const newClient = new Client(ws, userId, status)
      clientsGroupExists.clients.push(newClient)
    } else {
      console.log('Looks like a new host to repalcement')
      clientsGroupExists.clients.map(c => {
        if (c.status === status && c.userId === userId) {
          c.ws = ws
        }
        return c
      })
    }
  }
}

const processMessageFromClient = (msg, clientsArray, ws) => {

  const clientMessage = JSON.parse(msg)
  switch (clientMessage.messageType) {
    case 'connection':
      console.log('websocketService processMessage connection')
      processConnectionMessage(clientMessage, clientsArray, ws)
      break

    default:
      console.log('websocketService processMessage unknown')
      break
  }

  clientsArray.forEach(ws => {
    console.log('websocketService processMessage ws Hello', ws)
  })
}

const websocketService = {
  clients: [], // type WhiteboardClientsGroup[]
  sendMessage: function(message) {
    console.log('websocketService sendMessage message', message)
  },
  processMessage: function(msg, ws) {
    processMessageFromClient(msg, this.clients, ws)
  }
}

module.exports = websocketService
