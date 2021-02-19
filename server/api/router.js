const express = require('express');

const { redisClient, newRedisClient } = require('../connections/redis.js');
const { sleep } = require('../../shared/utils');

const MAX_MEMBERS_PER_LOBBY = 20;
const router = express.Router();

let waiting = new Map();
let unsubscribeTimeouts = new Map();
let subscriber = newRedisClient();

subscriber.on('message', (channel, _) => {
  if (waiting.has(channel)) {
    let resolves = waiting.get(channel);

    for (let i = resolves.length - 1; i >= 0; i--) {
      console.log('New message arrived');
      resolves[i]();
    }

    waiting.set(channel, []);
  }
});

router.get('/lobbies/new', async function(req, res) {
  let lobbyId = await redisClient.spopAsync('availableLobbyIds');

  if (lobbyId) {
    // Set up rooms
    console.log(`Creating lobby with id: ${lobbyId}`);
    let clientId = await redisClient.incrAsync(`lobbies/${lobbyId}/num-members`);

    res.status(200).json({
      lobby_id: lobbyId,
      client_id: clientId
    });
  } else {
    // Is internal server error appropriate?
    res.sendStatus(500);
  }
});

router.get('/lobbies/:id/join', async function(req, res) {
  console.log('/lobbies/:id/join');

  let lobbyId = req.params.id;

  if (await redisClient.existsAsync(`lobbies/${lobbyId}/num-members`)) {
    let clientId = await redisClient.incrAsync(`lobbies/${lobbyId}/num-members`);

    if (clientId > MAX_MEMBERS_PER_LOBBY) {
      return res.status(200).json({
        status: 'MaxMembersReached'
      });
    } else {
      res.status(200).json({
        status: 'Accept',
        client_id: clientId
      });
    }
  }
});

router.get('/lobbies/:id/:num_received', async function(req, res) {
  async function getNewMessages(lobbyId, numMessagesReceived) {
    let messagesLength = await redisClient.llenAsync(`lobbies/${lobbyId}/messages`);
    console.log(`Fetching messages from ${numMessagesReceived}, message length: ${messagesLength}`);
    return await redisClient.lrangeAsync(`lobbies/${lobbyId}/messages`, numMessagesReceived, messagesLength - 1);
  }

  let wait = req.get('prefer');
  let lobbyId = req.params['id'];
  let numMessagesReceived = parseInt(req.params['num_received']);

  console.log(`/lobbies/:id/num_received ${numMessagesReceived}`);

  let newMessages = await getNewMessages(lobbyId, numMessagesReceived);

  if (newMessages.length != 0) {
    res.status(200).json({
      messages: newMessages
    });

    return;
  }

  if (unsubscribeTimeouts.has(`lobbies/${lobbyId}/alerts`)) {
    clearTimeout(unsubscribeTimeouts.get(`lobbies/${lobbyId}/alerts`));
  }

  subscriber.subscribe(`lobbies/${lobbyId}/alerts`);

  // Let it unsubscribe in one minute if there are no activities in the channel
  let unsubscribe = setTimeout(function() {
    subscriber.unsubscribe(`lobbies/${lobbyId}/alerts`);
    unsubscribeTimeouts.delete(`lobbies/${lobbyId}/alerts`);
  }, 60000);
  unsubscribeTimeouts.set(`lobbies/${lobbyId}/alerts`, unsubscribe);

  if (!waiting.has(`lobbies/${lobbyId}/alerts`)) {
    waiting.set(`lobbies/${lobbyId}/alerts`, []);
  }
  
  if (wait && wait.match(/^wait=[0-9]+$/g)) {
    let tokens = wait.split('=');
    let waitMilliseconds = parseInt(tokens[1]);

    // Technically, this leads to a race condition where a publish
    // event happens between the time window when redis was last queried
    // and when the resolve function is added to waiting, but I think the worst thing that happens
    // is that the request waits for waitMilliseconds ms before being responded to.
    let resolveReq;
    let gotNewMessages = new Promise(function(resolve, reject) {
      resolveReq = resolve;
      waiting.get(`lobbies/${lobbyId}/alerts`).push(resolve);
    });

    let waitOrGetMessages = Promise.any([
      sleep(waitMilliseconds),
      gotNewMessages
    ])
      .then(() => {
        waiting.set(`lobbies/${lobbyId}/alerts`, waiting.get(`lobbies/${lobbyId}/alerts`).filter(i => i != resolveReq));
      })

    await waitOrGetMessages;
    newMessages = await getNewMessages(lobbyId, numMessagesReceived);
  }

  console.log('Sending new messages:', newMessages[0]);
  res.status(200).json({messages: newMessages});
});

router.post('/lobbies/:id/send', async function(req, res) {
  console.log('/lobbies/:id/send');

  let lobbyId = req.params['id'];

  await redisClient.rpushAsync(`lobbies/${lobbyId}/messages`, req.body);
  redisClient.publish(`lobbies/${lobbyId}/alerts`, 'New message');

  res.sendStatus(200);
});

module.exports = router;