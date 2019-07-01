const config = require('../config/config.json');
const request = require('request');
const fail = config.fail_emoji;
const success = config.success_emoji;
const logger = require('../utility/logger');
const voice = require('../utility/voice');

function execute(msg) {
    var voiceConnection = msg.guild.voiceConnection;
    if (voiceConnection) {
        voice.currentSong(msg, (err) => {
            msg.channel.send(`${fail} ERROR ENCOUNTERED: ${err.message}`);
        });
    } else {
        msg.channel.send(`${fail} I am not connected to a voice channel.`);
        logger.warn('Not connected to a voice channel.');
        return;
    }
}

module.exports = {
    "name": "current",
    "execute": execute
}