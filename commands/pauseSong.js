const config = require('../config/config.json');
const request = require('request');
const fail = config.fail_emoji;
const success = config.success_emoji;
const logger = require('../utility/logger');

function execute(msg) {
    var voiceChannel = msg.member.voiceChannel;
    var voiceConnection = voiceChannel.connection;
    if (voiceChannel || voiceConnection) {
        if (voiceConnection.speaking) {
            voiceConnection.dispatcher.pause();
            msg.channel.send(`${success} Paused current song.`);
            logger.info('Paused the song.');
        } else {
            msg.channel.send(`${fail} Sorry, there is nothing playing right now.`);
            logger.error('Not playing audio.');
            return;
        }
    } else {
        msg.channel.send(`${fail} Sorry, you must be in the same channel to do that.`);
        logger.error('Incorrect voice channel.');
        return;
    }
}

module.exports = {
    "name": "pause",
    "execute": execute
}