const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const config = require('./utils/config.json');
const formatMessage = require('./utils/message.js');
const {userJoin, getCurrentUser, getRoomUsers, userLeave} = require('./utils/users.js')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//static file path
app.use(express.static(path.join(__dirname, 'UserSide')))

// on connection
io.on('connection', socket => {
  socket.on('joinroom', ({username, room}) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(config.botname, `Hoşgeldin ${username}`))

    socket.broadcast.to(user.room).emit('message', formatMessage(config.botname, `${username}, ${room}a katıldı`))

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  socket.on('chatMessage', msg =>{
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg))

      var date = new Date();
      var offset = date.getTimezoneOffset();
      console.log(offset);
  })
  
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if(user){
      io.to(user.room).emit('message', formatMessage(config.botname, `${user.username}, odadan ayrıldı`))

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

// Set port
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running at ${PORT}`));
