require('dotenv').config();

const Lobby = require('../client/lobby');

const lobbyId = process.argv[2];

Lobby.join(process.env.RELAY_SERVER_ADDR, process.env.RELAY_SERVER_PORT, lobbyId)
  .then(function(lobby) {
    lobby.onMessage(function(messages) {
      for (let message of messages) {
        console.log(message);
      }
    });
  })
  .catch(function(err) {
    console.log(err);
  });