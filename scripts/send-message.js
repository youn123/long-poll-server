require('dotenv').config();

const Lobby = require('../client/lobby');

const lobbyId = process.argv[2];
const message = process.argv[3];

Lobby.join(process.env.RELAY_SERVER_ADDR, process.env.RELAY_SERVER_PORT, lobbyId)
  .then(function(lobby) {
    return lobby.send(message);
  })
  .then(() => {
    console.log(`Message ${message} sent.`);
  })
  .catch(function(err) {
    console.log(err);
  });