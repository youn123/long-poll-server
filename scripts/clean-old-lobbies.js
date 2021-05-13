require('dotenv').config();

const { cleanOldLobbies } = require('../server/tasks');
const { redisClient } = require('../server/connections/redis');

cleanOldLobbies()
  .then(() => {
    redisClient.quit();
  })
  .catch(function(err) {
    console.log(err);
  });