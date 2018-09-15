'use strict';

const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');
const setupAgent = require('./lib/agent');
const setupMetric = require('./lib/metric');
const defaults = require('defaults');
// const debug = require('debug')('platziverse:db')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pools: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    },
    setup: false
  });

  //  config = {
  //   database: process.env.DB_NAME || 'platziverse',
  //   username: process.env.DB_USER || 'platzi',
  //   password: process.env.DB_PASS || 'platzi',
  //   host: process.env.DB_HOST || 'localhost',
  //   port: '5434',
  //   dialect: 'postgres',
  //   logging: s => debug(s),
  //   setup: false
  // };

  const sequelize = setupDatabase(config);
  const AgentModel = setupAgentModel(config);
  const MetricModel = setupMetricModel(config);

  AgentModel.hasMany(MetricModel);
  MetricModel.belongsTo(AgentModel);

  await sequelize.authenticate();

  if (config.setup) {
    await sequelize.sync({force: true});
  }

  const Agent = setupAgent(AgentModel);
  const Metric = setupMetric(MetricModel, AgentModel);

  return {
    Agent,
    Metric
  };
};
