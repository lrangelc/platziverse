'use strict';

const debug = require('debug')('platziverse:mqtt');
const mosca = require('mosca');
const redis = require('redis');
const chalk = require('chalk');
const db = require('platziverse-db');
const { parsePayload } = require('./utils');

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
};

const settings = {
  port: 1883,
  backend
};

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  port: '5434',
  dialect: 'postgres',
  logging: s => debug(s),
  setup: false
};

const server = new mosca.Server(settings);
const clients = new Map();

let Agent, Metric;

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

function handleError (err) {
  console.error(`${chalk.red('[error]')} ${err.message}`);
  console.error(err.stack);
}

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError);

  Agent = services.Agent;
  Metric = services.Metric;

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`);
});

server.on('clientConnected', client => {
  let start = new Date().toUTCString();
  console.log(start);
  debug(`Client Connected: ${client.id}`);
  clients.set(client.id, null);
});

server.on('clientDisconnected', async client => {
//   cantidad++;
  debug(`******Client Disconnected: ${client.id}`);
  console.timeEnd('concatenation');
  console.log('<-----------------------');

  const agent = clients.get(client.id);
  console.log('disco%%%%');
  if (agent) {
    console.log('Mark Agent as Disconnected%%%%');
    // Mark Agent as Disconnected
    agent.connected = false;
    try {
      await Agent.createOrUpdate(agent);
      debug(`Actualizo que esta desconectado`);
    } catch (e) {
      debug(`No actualizo que esta desconectado`);
      return handleError(e);
    }

    // Delete Agent
    clients.delete(client.id);

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    });
    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`);
  } else {
    console.log('NO Mark Agent as Disconnected%%%%');
    debug(`No encontro ${client.id}`);
  }
});

server.on('published', async (packet, client) => {
  debug(`published Received: ${packet.topic}`);

  switch (packet.topic) {
    case 'agent/connected':
      debug(`Payload: ${packet.payload}`);
      break;

    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`);
      break;

    case 'agent/message':
      debug(`Payload: ${packet.payload}`);
      const payload = parsePayload(packet.payload);
      debug(`Payload2: ${payload}`);

      if (payload) {
        payload.agent.connected = true;
        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
          debug(`Ejecuto bien createOrUpdate`);
        } catch (e) {
          debug(`Error en createOrUpdate`);
          return handleError(e);
        }
        debug(`Agent ${agent.uuid} saved`);

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          debug(`grabo en clients ${client.id}`);
          clients.set(client.id, agent);
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          });
        }

        // Store Metrics
        // for (let metric of payload.metrics) {
        //   let m;

        //   try {
        //     m = await Metric.create(agent.uuid, metric);
        //   } catch (e) {
        //     return handleError(e);
        //   }

        //   debug(`Metric ${m.id} saved on agent ${agent.uuid}`);
        // }

        // Store Metrics EN PARALELO
        const promises = [];

        for (let metric of payload.metrics) {
          promises.push(saveMetric(agent, metric));
        }
        // Luego genero un array de promesas que se van ejecutando,
        // al final ejecuto un promise.all que en verdad no es necesario
        // al menos que quieras esperar que todas terminen de guardarse y
        // hacer algo al final.
        // (como mostrar un mensaje)
        // await Promise.all(promises);
      }

      break;
  }
});

function saveMetric (agent, metric) {
  return Metric.create(agent.uuid, metric)
    .then((m) => {
      debug(`Metric ${m.id} saved on agent ${agent.uuid}`);
      return m;
    })
    .catch(handleError);
}

server.on('error', handleFatalError);
server.on('uncaughtException', handleFatalError);
server.on('unhandledRejection', handleFatalError);
