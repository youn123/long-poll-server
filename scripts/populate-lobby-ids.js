require('dotenv').config();

const { populateAvailableLobbyIds } = require('../server/tasks');
const { redisClient } = require('../server/connections/redis');

const numKeys = process.argv[2] ? parseInt(process.argv[2]) : 100; 

populateAvailableLobbyIds(numKeys)
  .then(function() {
    console.log(`Succesfully populated ${numKeys} ids.`);

    redisClient.quit();
  })
  .catch(function(err) {
    console.log(err);
  });