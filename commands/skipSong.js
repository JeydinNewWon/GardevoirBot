const voice = require('../utility/voice');
const config = require('../config/config.json');
const logger = require('../utility/logger');
const ownerId = config.owner_id;

function execute(msg) {
    var voiceConnection = msg.guild.voiceConnection;
    if (voiceConnection) {
        if (msg.author.id === ownerId) {
            voice.skipSong(msg, voiceConnection, () => {
                logger.info(`Skipped song in guild: ${msg.guild.name} ID: ${msg.guild.id} by the owner.`);
            });
        } else if (msg.member.voiceChannelID === msg.guild.me.voiceChannelID) {
            voice.addSkipVote(msg, voiceConnection, (err) => {
                if (err) {
                    msg.channel.send(`${fail} ERROR ENCOUNTERED: ${err.message}`);
                    return logger.error(`ERROR ENCOUNTERED: ${err.message}`);
                }
                logger.info(`Skipped song in guild: ${msg.guild.name} ID: ${msg.guild.id}.`);
            });
        } else {
            msg.channel.send(`${fail} You must be in the same channel to skip the song.`);
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
    "name": "skip",
    "execute": execute
}