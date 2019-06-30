const config = require('../config/config.json');
const fail = config.fail_emoji;
const logger = require('../utility/logger');
const voice = require('../utility/voice');

function execute(msg) {
    var searchQuery = msg.content.substr(msg.prefix.length+5);
    var voiceChannel = msg.member.voiceChannel;

    if (searchQuery && searchQuery !== "") {
        if (voiceChannel) {
            if (msg.guild.me.hasPermission(['CONNECT', 'SPEAK'])) {
                if (voiceChannel.memberPermissions(msg.guild.me).has(['CONNECT', 'SPEAK'])) {
                    if (!voiceChannel.connection) {
                        voiceChannel.join()
                            .then((connection) => {
                                voice.playSongFirst(msg, connection, searchQuery, (err) => {
                                    if (err) {
                                        msg.channel.send(`${fail} Looks like there is an error.`);
                                        logger.error(err.message);
                                        return;
                                    }
                                });
                            })
                            .catch((err) => {
                                msg.channel.send(`${fail} There was an error in joining voice channel.`);
                                logger.error(`Error in joining voice channel: ${err.message}`);
                            });
                    } else {
                        voice.addSong(msg, searchQuery, (err) => {
                            if (err) {
                                msg.channel.send(`${fail} Sorry, there was an error in adding that song.`);
                                return logger.error(err.message);
                            }
                        });
                    }
                } else {
                    msg.channel.send(`${fail} I do not have permission to connect or speak in the voice channel.`);
                    return logger.warn('Insufficient permissions to connect or speak in the voice channel.'); 
                }
            } else {
                msg.channel.send(`${fail} I do not have permission to join the voice channel.`);
                return logger.warn('Insufficient permissions to join voice channel.');          
            }
        } else {
            msg.channel.send(`${fail} Please join a voice channel before requesting a song.`);
            return logger.warn('Did not join a voice channel to start song.');
        }   
    } else {
        msg.channel.send(`${fail} Please provide a video to search for.`);
        return logger.warn('No video search query given.');
    }
}

module.exports = {
    "name": "play",
    "execute": execute
}