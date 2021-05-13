/**
 * Entry point of server. 
 */
require('dotenv').config();
const any = require('promise.any');

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./api/router');

const { cleanOldLobbies } = require('./tasks');

any.shim();

const app = express();
// middleware
app.use(bodyParser.raw({
  type: 'text/plain'
}));

app.get('/ping', (_, res) => res.send('PONG'));
app.use(routes);

const port = process.env.PORT ? process.env.PORT : 8080;
app.listen(port, () => console.log(`App listening on port ${port}...`));

// Clean every 30 minutes.
setInterval(function() {
  cleanOldLobbies();
}, 1800000);
