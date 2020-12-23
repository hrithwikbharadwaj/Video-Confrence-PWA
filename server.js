const express = require('express')
const app = express()
var cors = require('cors')

// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
var forceSSL = require('express-force-ssl');
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')
app.use(cors())
app.use('/peerjs', peerServer);
app.set('forceSSLOptions', {
  enable301Redirects: false,
  trustXFPHeader: false,
  httpsPort: 443,
});
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/',forceSSL, (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
     
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
    
  })
  
})

server.listen(process.env.PORT||3030)
