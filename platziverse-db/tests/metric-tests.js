'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const metricFixtures = require('./fixtures/metric');
const agentFixtures = require('./fixtures/agent');

let config = {
  logging () {}
};

let uuid = 'yyy-yyy-yyy';
let type = 'CPU';
let MetricStub = null;
let AgentStub = null;
let db = null;
let sandbox = null;

let uuidArgs = {
  where: { uuid }
};

let metricUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
};

let typeUuidArgs = {
  attributes: [ 'id', 'type', 'value', 'created_at' ],
  where: {
    type
  },
  limit: 20,
  order: [[ 'created_at', 'DESC' ]],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
};

let newMetric = {
  agent_id: 1,
  type: 'CPU',
  value: '18%'
};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();

  MetricStub = {
    belongsTo: sinon.spy()
  };

  AgentStub = {
    hasMany: sinon.spy()
  };

  // Model create Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  MetricStub.create = sandbox.stub();
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric; }
  }));

  metricUuidArgs.include[0].model = AgentStub;
  typeUuidArgs.include[0].model = AgentStub;

  // Model findAll Stub
  MetricStub.findAll = sandbox.stub();
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all));
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)));
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)));

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  });

  db = await setupDatabase(config);
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist');
});

test.serial('Setup Metric', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed');
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel');
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed');
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel');
});

test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid);

  t.true(MetricStub.findAll.called, 'findAll should be called on model');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll should be called with specified metricUuidArgs');

  t.deepEqual(metric, metricFixtures.findByAgentUuid(uuid), 'should be the same');
});

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid(type, uuid);

  t.true(MetricStub.findAll.called, 'findAll should be called on model');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with specified typeUuidArgs');

  t.deepEqual(metric, metricFixtures.findByTypeAgentUuid(type, uuid), 'should be the same');
});

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric);

  t.true(AgentStub.findOne.called, 'Agent findOne should be called on model');
  t.true(AgentStub.findOne.calledOnce, 'Agent findOne should be called once');
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args');

  t.true(MetricStub.create.called, 'create should be called on model');
  t.true(MetricStub.create.calledOnce, 'create should be called once');
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with specified args');

  t.deepEqual(metric, newMetric, 'agent should be the same');
});
