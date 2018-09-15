'use strict';

const debug = require('debug')('platziverse:api:routes');
const express = require('express');
const apiError = require('./apiError');
const asyncify = require('express-asyncify');
const db = require('platziverse-db');

const config = require('./config');

const api = asyncify(express.Router());

let services, Agent, Metric;

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database');
    try {
      services = await db(config.db);
    } catch (e) {
      return next(e);
    }
    Agent = services.Agent;
    Metric = services.Metric;
  }
  next();
});

api.get('/agents', async (req, res, next) => {
  debug('A request has come to /agents');

  let agents = [];

  try {
    agents = await Agent.findConnected();
  } catch (e) {
    return next(e);
  }

  res.status(200).send(agents);
});

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params;
  debug(`A request has come to /agent/${uuid}`);

  let agent;

  try {
    agent = await Agent.findByUuid(uuid);
  } catch (e) {
    return next(e);
  }

  if (!agent) {
    return next(new apiError.AgentNotFoundError(uuid));
    // return next(new Error('Agent not found'));
  }

  res.send(agent);
});

api.get('/metrics/:uuid', async (req, res, next) => {
  const {uuid} = req.params;
  debug(`A request has come to /metrics/${uuid}`);

  let metrics = [];
  try {
    metrics = await Metric.findByAgentUuid(uuid);
  } catch (e) {
    return next(e);
  }

  if (!metrics || metrics.length === 0) {
    return next(new apiError.MetricsNotFoundError(uuid));
  }

  res.send(metrics);
});

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const {uuid, type} = req.params;
  debug(`A request has come to /metrics/${uuid}/${type}`);

  let metrics = [];
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid);
  } catch (e) {
    return next(e);
  }

  if (!metrics || metrics.length === 0) {
    return next(new apiError.MetricsNotFoundError(uuid, type));
  }

  res.send(metrics);
});

module.exports = api;
