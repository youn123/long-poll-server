  /**
 * Entry point of server. 
 */
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./api/router');

const app = express();
// middleware
app.use(bodyParser.json());

app.get('/ping', (_, res) => res.send('PONG'));
app.use(routes);

const port = 8080;
app.listen(port, () => console.log(`App listening on port ${port}...`));