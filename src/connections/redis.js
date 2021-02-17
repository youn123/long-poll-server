const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(6380, process.env.REDIS_HOST_NAME, {
  auth_pass: process.env.REDIS_CACHE_KEY,
  tls: {
    servername: process.env.REDIS_HOST_NAME
  }
});

client.getAsync = promisify(client.get);
client.existsAsync = promisify(client.exists);
client.delAsync = promisify(client.del);
client.setAsync = promisify(client.set);
client.saddAsync = promisify(client.sadd);

module.exports = client;