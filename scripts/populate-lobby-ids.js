require('dotenv').config();

const { populateAvailableLobbyIds } = require('../server/tasks');

populateAvailableLobbyIds(100)
  .then(function() {
    console.log('Populated some ids.')
  })
  .catch(function(err) {
    console.log(err);
  });