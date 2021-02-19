const { redisClient} = require('../connections/redis');

const chars = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';

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
      redisClient.quit();
      resolve();
    });
  });
}

module.exports = {
  populateAvailableLobbyIds
};