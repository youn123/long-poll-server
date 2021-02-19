const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(6380, process.env.REDIS_HOST_NAME, {
  auth_pass: process.env.REDIS_CACHE_KEY,
  tls: {
    servername: process.env.REDIS_HOST_NAME
  }
});

function newRedisClient() {
  return redis.createClient(6380, process.env.REDIS_HOST_NAME, {
    auth_pass: process.env.REDIS_CACHE_KEY,
    tls: {
      servername: process.env.REDIS_HOST_NAME
    }
  });
}

client.getAsync = promisify(client.get);
client.existsAsync = promisify(client.exists);
client.delAsync = promisify(client.del);
client.setAsync = promisify(client.set);
client.saddAsync = promisify(client.sadd);
client.spopAsync = promisify(client.spop);
client.incrAsync = promisify(client.incr);
client.llenAsync = promisify(client.llen);
client.lrangeAsync = promisify(client.lrange);
client.rpushAsync = promisify(client.rpush);

module.exports = {redisClient: client, newRedisClient};