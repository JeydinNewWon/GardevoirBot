const config = require('../config/config.json');
const request = require('request');
const fail = config.fail_emoji;
const success = config.success_emoji;
const logger = require('../utility/logger');

function execute(msg) {
    var voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel || !voiceChannel.connection) {
        msg.channel.send(`${fail} Sorry, you must be in the same channel to do that.`);
        logger.error('Incorrect voice channel.');
        return;
    }

    var connection = voiceChannel.connection;
    if (!connection.speaking && !connection.dispatcher) {
        msg.channel.send(`${fail} Sorry, there is nothing playing right now.`);
        logger.error('Not playing audio.');
        return;
    }

    var dispatcher = connection.dispatcher;
    dispatcher.resume();
    msg.channel.send(`${success} Resumed current song.`);
    logger.info('Resumed the song.');
}

module.exports = {
    "name": "resume",
    "execute": execute
}