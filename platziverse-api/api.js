'use strict';

const debug = require('debug')('platziverse:api:routes');
const express = require('express');
const apiError = require('./apiError');

const api = express.Router();

api.get('/agents', (req, res) => {
  debug('A request has come to /agents');
  res.status(200).send({});
});

api.get('/agent/:uuid', (req, res, next) => {
  debug('A request has come to /agent/:uuid');
  const { uuid } = req.params;

  if (uuid !== 'yyy') {
    return next(new apiError.AgentNotFoundError(uuid, 'Agent not found'));
    // return next(new Error('Agent not found'));
  }

  res.send({uuid});
});

api.get('/metrics/:uuid', (req, res) => {
  debug('A request has come to /metrics/:uuid');
  const {uuid} = req.params;

  res.send({uuid});
});

api.get('/metrics/:uuid/:type', (req, res) => {
  debug('A request has come to /metrics/:uuid/:type');
  const {uuid, type} = req.params;

  res.send({uuid, type});
});

module.exports = api;
