require('dotenv').config();

const Lobby = require('./lobby');

const lobbyId = process.argv[2];

Lobby.join(process.env.RELAY_SERVER_ADDR, process.env.RELAY_SERVER_PORT, lobbyId)
  .then(lobby => {
    console.log(`My client ID is ${lobby.clientId}`);

    // lobby.onMessage(function(messages) {
    //   for (let message of messages) {
    //     console.log(message.body);
    //   }
    // });
  });