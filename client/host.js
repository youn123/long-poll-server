require('dotenv').config();

const Lobby = require('./lobby');

Lobby.create(process.env.RELAY_SERVER_ADDR, process.env.RELAY_SERVER_PORT)
  .then(lobby => {
    console.log(`Lobby created with id: ${lobby.lobbyId}`);
  });