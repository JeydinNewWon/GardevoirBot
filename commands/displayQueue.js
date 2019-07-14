const voice = require('../utility/voice');
const config = require('../config/config.json');
const fail = config.fail_emoji;
const logger = require('../utility/logger');

function execute(msg) {
    var voiceConnection = msg.guild.voiceConnection;
    if (voiceConnection) {
        voice.serverQueue(msg, (err) => {
            if (err) {
                msg.channel.send(`${fail} ERROR ENCOUNTERED: ${err.message}`);
            }
        });
    } else {
        msg.channel.send(`${fail} I am not connected to a voice channel.`);
        logger.warn('Not connected to a voice channel.');
        return;
    }
}

module.exports = {
    "name": "queue",
    "execute": execute
}