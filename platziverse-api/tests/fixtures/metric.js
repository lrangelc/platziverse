'use strict';

const agentFixtures = require('./agent');
const utils = require('../../utils');

const extend = utils.extend;

const metric = {
  id: 1,
  agent_id: 1,
  type: 'CPU',
  value: '18%',
  created_at: new Date(),
  agent: agentFixtures.findById(1)
};

const metrics = [
  metric,
  extend(metric, { id: 2, value: '25%' }),
  extend(metric, { id: 3, value: '2%' }),
  extend(metric, { id: 4, agent_id: 2, type: 'CPU', value: '33%', agent: agentFixtures.findById(2) })
];

function findByAgentUuid (uuid) {
  return metrics.filter(m => m.agent ? m.agent.uuid === uuid : false).map(m => {
    const clone = Object.assign({}, m);

    delete clone.agent;

    return clone;
  });
}

function findByTypeAgentUuid (type, uuid) {
  return metrics.filter(m => m.type === type && (m.agent ? m.agent.uuid === uuid : false)).map(m => {
    const clone = Object.assign({}, m);

    delete clone.agent_id;
    delete clone.agent;

    return clone;
  }).sort(utils.sortBy('created_at')).reverse();
}

module.exports = {
  all: metrics,
  findByAgentUuid,
  findByTypeAgentUuid
};
