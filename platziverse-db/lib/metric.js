'use strict';

const sequelize = require('sequelize');

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function findByAgentUuid (uuid) {
    return MetricModel.findAll({attributes: ['type', [sequelize.fn('count', sequelize.col('metric.id')), 'Registros']],
      group: ['type'],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    });
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'created_at', 'agent_id'],
      where: {
        type
      },
      limit: 20,
      order: [['created_at', 'DESC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    });
  }

  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({
      where: {uuid}
    });

    if (agent) {
      // metric.agent_id = agent.id
      Object.assign(metric, {agent_id: agent.id});
      const result = await MetricModel.create(metric);
      return result.toJSON();
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  };
};
