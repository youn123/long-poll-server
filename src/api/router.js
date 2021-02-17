const express = require('express');

const redisClient = require('../connections/redis.js');
const { sleep } = require('../utils');

const router = express.Router();

router.get('/status', async function(req, res) {
  // TODO
  let wait = req.get('prefer');

  if (wait && wait.match(/^wait=[0-9]+$/g)) {
    let tokens = wait.split('=');
    let waitMilliseconds = parseInt(tokens[1]);

    console.log(`Waiting ${waitMilliseconds} ms before responding...`);
    await sleep(waitMilliseconds);
  }

  res.status(200).send('Hello');
});

router.get('/redis', function(req, res) {
  redisClient.getAsync('greeting')
    .then(function(val) {
      console.log(typeof(val));
      res.status(200).send(val);
    });
});

module.exports = router;