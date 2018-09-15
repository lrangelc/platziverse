'use strict';

const debug = require('debug')('platziverse:db:setup');
const inquirer = require('inquirer');
const chalk = require('chalk');
const db = require('./');

const prompt = inquirer.createPromptModule();

async function setup () {
  // Automatización del Script de creación de la Database
  let flag = false;

  process.argv.forEach(e => {
    if (e === '--yes') {
      flag = true;
    }
  });
console.log("VICTORIA");
  if (!flag) {
    // Pregunta en la consola
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ]);

    // Si la respuesta es falsa (es negativa), no pasa nada
    // Si la respuesta es verdadera (es positia), re-crea la DB
    if (!answer.setup) {
      return console.log('Nothing happended :)');
    }
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: '5434',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  };
  
  console.log(config);
  await db(config).catch(handleFatalError);

  console.log('Success!');
  process.exit(0);
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${chalk.blue(err.message)}`);
  console.error(err.stack);
  process.exit(1);
}

setup();
