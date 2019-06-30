const config = require('../config/config.json');
const request = require('request');
const fail = config.fail_emoji;
const success = config.success_emoji;
const logger = require('../utility/logger');

function execute(msg) {
    var connection = msg.guild.voiceConnection;
    if (!connection) {
        msg.channel.send(`${fail} There is no song currently playing.`);
        logger.warn('No song currently playing.');
        return;
    }

    connection.disconnect();
    connection.channel.leave();
    msg.channel.send(`${success} Left the queue.`);
    logger.info('Left the voice channel.');
}

module.exports = {
    "name": "stop",
    "execute": execute
}