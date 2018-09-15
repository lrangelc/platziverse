'use strict';

const debug = require('debug')('platziverse:api:db');

module.exports = {
  db: {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: '5434',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: false
  }
};
