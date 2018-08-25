'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend ={
    type: 'redis',
    redis,
    return_buffers: true
}

const settings = {
    port: 1883,
    backend
}

const server = new mosca.Server(settings)
var cantidad = 0

function handleFatalError(err) {
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

server.on('ready', () => {
    console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
    console.log(`Cantidad ${cantidad}`)
})

server.on('clientConnected', client => {
    cantidad = 0
    console.log('----------------------->')
    let start = new Date().toUTCString();
    console.log(start)
    console.time("concatenation");
    debug(`Client Connected: ${client.id}`)
    console.log(`clientConnected Cantidad ${cantidad}`)
    console.log('')
})

server.on('clientDisconnected', client => {
    cantidad++
    debug(`Client Disconnected: ${client.id}`)
    console.timeEnd("concatenation");
    console.log('<-----------------------')
    console.log(`clientDisconnected Cantidad ${cantidad}`)
    console.log('')
})

server.on('published', (packet, client) => {
    cantidad++
    debug(`Received: ${packet.topic}`)
    debug(`Payload: ${packet.payload}`)
    console.log(`published Cantidad ${cantidad}`)
    console.log('')
})

server.on('error', handleFatalError)
server.on('uncaughtException', handleFatalError)
server.on('unhandledRejection', handleFatalError)
