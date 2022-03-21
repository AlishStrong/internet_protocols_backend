const testService = {
  call: function(msg) {
    console.log('testService msg', msg)
    console.log('testService call clients', this.clients.length)
    this.clients.forEach(ws => {
      // ws.send('Hello to all clients')
      console.log('testService ws Hello', ws)
    })
  },
  clients: [1, 2, 3]
}

module.exports = testService
