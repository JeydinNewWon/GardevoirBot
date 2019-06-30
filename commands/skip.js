const voice = require('../utility/voice');
const config = require('../config/config.json');
const logger = require('../utility/logger');
const ownerId = config.owner_id;

function execute(msg) {
    if (msg.author.id === ownerId) {
        voice.skipSong(msg.guild.voiceConnection, () => {
            return logger.info(`Skipped song in guild: ${msg.guild.name} ID: ${msg.guild.id}`);
        });
    } else {
        
    }

}

module.exports = {
    "name": "skip",
    "execute": execute
}