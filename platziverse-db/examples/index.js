'use strict';

const db = require('../');

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: '5434',
    dialect: 'postgres',
    setup: false
  };

  const {Agent, Metric} = await db(config).catch(handleFatalError);

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError);

  console.log('--agent--');
  console.log(agent);

  const agents = await Agent.findAll().catch(handleFatalError);
  console.log('--agents--');
  console.log(agents);

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '350'
  });
  console.log('--metric--');
  console.log(metric);

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError);
  console.log('--metrics--');
  console.log(metrics);

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError);
  console.log('--metrics by type--');
  console.log(metricsByType);
}

function handleFatalError (err) {
  console.log(err.message);
  console.log(err.stack);
  process.exit(1);
}

run();
