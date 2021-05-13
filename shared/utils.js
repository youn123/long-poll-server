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

function getFriendlyAge(timestamp) {
  let now = Date.now() / 1000;
  let duration = now - (timestamp / 1000);

  let count;

  if (duration < 60) {
      return `${Math.round(duration)}s`;
  } else if (duration >= 60 && duration < 3600) {
      count = Math.round(duration / 60);
      return `${count}m`;
  } else if (duration < 3600*24) {
      count = Math.round(duration / 3600);
      return `${count}h`;
  } else if (duration < 3600*24*7) {
      count = Math.round(duration / (3600*24));
      return `${count}d`;
  } else if (duration < 3600*24*365) {
      count = Math.round(duration / (3600*24*7));
      return `${count}w`;
  } else {
      count = Math.round(duration / (3600*24*30));
      return `${count}y`;
  }
}

module.exports = {
  sleep,
  generateRandomBase64String,
  getFriendlyAge
};