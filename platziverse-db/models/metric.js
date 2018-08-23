'use strict';

const Sequelize = require('sequelize');
const setupDatabase = require('../lib/db');

module.exports = function setupMetricModel (config) {
  const sequelize = setupDatabase(config);

  // var Bar = sequelize.define('Bar', { /* bla */ }, {
  // don't add the timestamp attributes (updatedAt, createdAt)
  // timestamps: false,

  // don't delete database entries but set the newly added attribute deletedAt
  // to the current date (when deletion was done). paranoid will only work if
  // timestamps are enabled
  // paranoid: true,

  // don't use camelcase for automatically added attributes but underscore style
  // so updatedAt will be updated_at
  // underscored: true,

  // disable the modification of tablenames; By default, sequelize will automatically
  // transform all passed model names (first parameter of define) into plural.
  // if you don't want that, set the following
  // freezeTableName: true,

  // define the table's name
  // tableName: 'my_very_custom_table_name'
  // })

  return sequelize.define('metric', {
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  },
  {
    underscored: true,
    freezeTableName: true,
    tableName: 'metric'
  });
};
