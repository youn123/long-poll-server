require('dotenv').config();

const { populateAvailableLobbyIds } = require('../server/tasks');

const numKeys = process.argv[2] ? parseInt(process.argv[2]) : 100; 

populateAvailableLobbyIds(numKeys)
  .then(function() {
    console.log(`Succesfully populated ${numKeys} ids.`)
  })
  .catch(function(err) {
    console.log(err);
  });