require('dotenv').config();

const { redisClient } = require('../server/connections/redis');

const verbosity = process.argv[2];

console.log('Fetching all keys...');

redisClient.keys('*', (error, keys) => {
  if (error) {
    console.log('Flush failed:\n');
    console.log(error);
    process.exit(0);
  }

  redisClient.flushall(error => {
    if (error) {
      console.log('Flush failed:\n');
      console.log(error);
      process.exit(0);
    }

    console.log(`Flushed ${keys.length} entries.`);

    if (verbosity == '--verbose') {
      console.log('-------------');
      for (let key of keys) {
        console.log(key);
      }
    }

    process.exit(0);
  });
});