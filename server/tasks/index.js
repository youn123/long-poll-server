const { redisClient} = require('../connections/redis');
const { getFriendlyAge } = require('../../shared/utils');

const chars = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
// 6 hours
const LOBBY_CLAIM_TIME = parseInt(process.env.LOBBY_CLAIM_TIME);

function populateAvailableLobbyIds(numIds) {
  let multi = redisClient.multi();

  return new Promise(function(resolve, reject) {
    let i = 0;

    for (let a = 0; a < chars.length && i < numIds; a++) {
      for (let b = 0; b < chars.length && i < numIds; b++) {
        for (let c = 0; c < chars.length && i < numIds; c++) {
          for (let d = 0; d < chars.length && i < numIds; d++) {
            for (let e = 0; e < chars.length && i < numIds; e++, i++) {
              let id = [chars[a], chars[b], chars[c], chars[d], chars[e]].join('');
              multi.sadd('availableLobbyIds', id);
            }
          }
        }
      }
    }

    multi.exec(function(err, _) {
      if (err) reject(err);
      resolve();
    });
  });
}

async function cleanOldLobbies() {
  console.log('cleanOldLobbies task started.');

  let numLobbiesCleaned = 0;
  let multi = redisClient.multi();

  return new Promise(async function(resolve, reject) {
    let allClaimedLobbies = await redisClient.smembersAsync('claimedLobbyIds');

    for (let lobbyId of allClaimedLobbies) {
      let now = Date.now();
      let birthTime = await redisClient.getAsync(`lobbies/${lobbyId}/birth-time`);
      let age = now - birthTime;
  
      console.log(`  ${lobbyId} is ${getFriendlyAge(birthTime)} old.`)
  
      if (age > LOBBY_CLAIM_TIME) {
        multi.del(`lobbies/${lobbyId}*`);
        multi.sadd('availableLobbyIds', lobbyId);
  
        numLobbiesCleaned++;
      }
    }
  
    multi.exec(function(err, _) {
      if (err) reject(err);
  
      console.log(`Cleaned ${numLobbiesCleaned} lobbies.`);
      resolve();
    });
  });
}

module.exports = {
  populateAvailableLobbyIds,
  cleanOldLobbies
};