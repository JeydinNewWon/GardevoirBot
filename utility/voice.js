const config = require('../config/config.json');
const logger = require('./logger');
const youtubeSearch = require('./youtube');
const ytdl = require('ytdl-core');
const queueModel = require('../DB/queue');
const songModel = require('../DB/song');
const success = config.success_emoji;
const fail = config.fail_emoji;
const musicAdd = config.music_add_emoji;

function playSongFirst(msg, voiceConnection, searchQuery, cb) {
    var guildId = msg.guild.id;
    checkQueues(guildId, (err) => {
        if (err) {
            return cb(err);
        }

        createSong(msg, searchQuery, (err, song) => {
            if (err) {
                return cb(err);
            }

            var audioStream = ytdl(song.url, { filter: 'audio' });
            var dispatcher = voiceConnection.playStream(audioStream);

            addSongToQueue(msg, guildId, song, (err, url) => {
                if (err) {
                    return cb(err);
                }
                msg.channel.send(`**Now Playing: ** \`${song.title}\``);
                cb();
                nextSong(msg, dispatcher, voiceConnection, guildId, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    msg.channel.send(`${success} No more songs to play. Exited the channel.`);
                });
            });
        });
    });
}

function addSong(msg, searchQuery, cb) {
    var guildId = msg.guild.id;
    createSong(msg, searchQuery, (err, song) => {
        if (err) {
            return cb(err);
        }
        addSongToQueue(msg, guildId, song, (err) => {
            if (err) {
                return cb(err);
            }
        })
    });
}

function skipSong(voiceConnection, cb) {
    voiceConnection.dispatcher.end();
    cb();
}

function checkQueues(guildId, cb) {
    queueModel.findOne({ guildId: guildId }, (err, res) => {
        if (err) {
            logger.error('Error in finding Queue');
            return cb(err);
        }

        if (!res) {
            var queue = new queueModel({
                guildId: guildId,
                songs: [],
                repeat: false,
                skipVotes: []
            });

            queue.save((err) => {
                if (err) {
                    logger.error('Error in creating Queue');
                    return cb(err);
                }
                logger.info(`Created new Queue. ID: ${guildId}`);
                cb();
            });

        } else {
            cb();
        }
    });
}

function createSong(msg, searchQuery, cb) {
    youtubeSearch(searchQuery, (err, data) => {
        if (err) {
            return cb(err);
        }

        var song = new songModel({
            title: data.title,
            duration: data.duration,
            addedBy: msg.author.tag,
            addedById: msg.author.id,
            url: data.url,
            thumbnail: data.thumbnail
        });

        song.save((err) => {
            if (err) {
                return cb(err);
            }
            cb(null, song);
            logger.info(`Saved song: ${data.title} to the database.`);
        });
    });
}

function addSongToQueue(msg, guildId, song, cb) {
    queueModel.findOne({ guildId: guildId }, (err, Queue) => {
        if (err) {
            return cb(err);
        }

        Queue.addSong(song, (err) => {
            if (err) {
                return cb(err);
            }
            msg.channel.send(`${musicAdd} **Added** \`${song.title}\`.`);
            cb(err, song.url);
        });
    });
}

function nextSong(msg, dispatcher, voiceConnection, guildId, cb) {
    dispatcher.on('end', () => {
        removeOldestSong(guildId, (err, songs) => {
            if (err) {
                return cb(err);
            }
            if (songs.length > 0) {
                var url = songs[0].url;
                var audioStream = ytdl(url, { filter: 'audio' });
                var newDispatcher = voiceConnection.playStream(audioStream);
                msg.channel.send(`**Now playing: ** \`${songs[0].title}\``);
                nextSong(msg, newDispatcher, voiceConnection, guildId, cb);
            } else {
                voiceConnection.disconnect();
                voiceConnection.channel.leave();
                cb();
            }
        });
    });
}

function removeOldestSong(guildId, cb) {
    queueModel.findOne({ guildId: guildId}, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        Queue.removeOldest((err, updatedSongs) => {
            if (err) {
                return cb(err);
            }
            cb(null, updatedSongs);
        })
    });
}

module.exports = {
    "playSongFirst": playSongFirst,
    "addSong": addSong,
    "skipSong": skipSong
}
