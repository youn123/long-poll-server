const fetch = require('node-fetch');

class Lobby {
  constructor(serverAddr, serverPort, lobbyId, clientId, isHost=false) {
    this.serverAddr = serverAddr;
    this.serverPort = serverPort;
    this.lobbyId = lobbyId;
    this.clientId = clientId;
    this.isHost = isHost;

    this.numMessagesReceived = 0;
    this.pending = new Map();

    this.onMessage.bind(this);
    this.send.bind(this);
    this._continuouslyFetch.bind(this);
    this._fetchMessages.bind(this);
  }

  onMessage(callback) {
    // First time callback is attached
    if (!this.callback) {
      this.callback = callback;
      this._continuouslyFetch();
    }
  }

  send(message) {
    return fetch(`${this.serverAddr}:${this.serverPort}/lobbies/${this.lobbyId}/send`, {
      method: 'POST',
      headers: {
        'Content-type': 'text/plain'
      },
      body: message
    })
      .then(res => {
        if (res.status != 200) {
          throw new Error();
        }
      });
  }

  quit() {
    this.stop = true;

    // TODO
  }

  _continuouslyFetch() {
    return this._fetchMessages()
      .then(() => {
        if (!this.stop) {
          setTimeout(this._continuouslyFetch.bind(this), 1);
        }
      })
      .catch(err => {
        if (!this.stop) {
          setTimeout(this._continuouslyFetch.bind(this), 1);
        }

        console.log(err);
      });
  }

  _fetchMessages() {
    return fetch(`${this.serverAddr}:${this.serverPort}/lobbies/${this.lobbyId}/${this.numMessagesReceived}`, {
      headers: {
        prefer: 'wait=20000'
      }
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        // let messages = [];

        // for (let message of json.messages) {
        //   if (message.to.contains(this.clientId) && message.message_id) {

        //   }
        //   if (message.to === 'all' || message.to.contains(this.clientId)) {
        //     messages.push(message);
        //   }
        // }

        this.numMessagesReceived += json.messages.length;
        if (!this.stop) {
          this.callback(json.messages);
        }
      });
  }
}

function create(serverAddr, serverPort) {
  return fetch(`${serverAddr}:${serverPort}/lobbies/new`)
    .then(res => {
      return res.json();
    })
    .then(json => {
      return new Lobby(serverAddr, serverPort, json.lobby_id, json.client_id, true);
    });
}

function join(serverAddr, serverPort, lobbyId) {
  return fetch(`${serverAddr}:${serverPort}/lobbies/${lobbyId}/join`)
    .then(res => {
      return res.json();
    })
    .then(json => {
      if (json.status == 'Accept') {
        return new Lobby(serverAddr, serverPort, lobbyId, json.client_id);
      }

      throw new Error('Could not join for some reason.');
    });
}

module.exports = {
  create,
  join
};



