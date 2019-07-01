const config = require('../config/config.json');
const request = require('request');
const fail = config.fail_emoji;
const success = config.success_emoji;
const logger = require('../utility/logger');
const voice = require('../utility/voice');


function execute(msg) {
    var voiceConnection = msg.guild.voiceConnection;
    if (voiceConnection) {
        if (msg.member.voiceChannelID === msg.guild.me.voiceChannelID) {
            voice.setRepeat(msg, (err, repeatState) => {
                if (err) {
                    msg.channel.send(`${fail} ERROR ENCOUNTERED: ${err.message}`);
                    return logger.error(`ERROR ENCOUNTERED: ${err.message}`);
                }
                msg.channel.send(`:repeat: Set repeat state to **${repeatState}**.`);
            });
        } else {
            msg.channel.send(`${fail} You must be in the same channel to stop the bot.`);
            logger.warn('You must be in the same voicechannel.');
            return;
        }
    } else {
        msg.channel.send(`${fail} I am not connected to a voice channel.`);
        logger.warn('Not connected to a voice channel.');
        return;
    }
}

module.exports = {
    "name": "repeat",
    "execute": execute
}