const crypto = require('crypto');

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms);
  });
}

function generateRandomBase64String(length) {
  let str = crypto.randomBytes(Math.ceil(length * 6 / 8)).toString('base64');
  return str.substring(0, length);
}

module.exports = {
  sleep,
  generateRandomBase64String
};