const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('joinroom', {username, room})

socket.on('roomUsers', ({room, users}) => {
  outputRoom(room);
  outputUsers(users);
})

//message from server
socket.on('message', message =>{

  //call funciton
  outputMessage(message)

  chatMessages.scrollTop = chatMessages.scrollHeight;
})

//send message
chatForm.addEventListener('submit', (e) => {

  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
})

//message write function
function outputMessage(msg){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p> <p class="text"> ${msg.text} </p>`;
  document.querySelector('.chat-messages').appendChild(div);

}

function outputUsers(users){
  userList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

function outputRoom(room){
  roomName.innerText = room;
}
