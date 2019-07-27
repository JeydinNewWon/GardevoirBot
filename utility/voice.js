const Discord = require('discord.js');
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

function skipSong(msg, voiceConnection, cb) {
    queueModel.findOne({ guildId: msg.guild.id }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        if (Queue.repeat) {
            setRepeat(msg, () => {
                voiceConnection.dispatcher.end('skip');
                setRepeat(msg, () => {
                    cb();
                });
            });
        } else {
            voiceConnection.dispatcher.end('skip');
            cb();
        }
    });
}

function addSkipVote(msg, voiceConnection, cb) {
    var vote = msg.author.id;
    queueModel.findOne({ guildId: msg.guild.id }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        if (Queue.skipVotes.includes(vote)) {
            msg.channel.send(`${fail} You've already voted to skip.`);
        } else {
            Queue.addVote(vote, (err) => {
                if (err) {
                    return cb(err);
                }
                queueModel.findOne({ _id: Queue._id }, (err, updatedQueue) => {
                    if (err) {
                        return cb(err);
                    }
                    var members = voiceConnection.channel.members.filter(member => !member.user.bot);
                    updatedQueue.checkVotes(members.size, (err, isEnoughVotes) => {
                        if (err) {
                            return cb(err);
                        }
                        if (isEnoughVotes) {
                            msg.channel.send(`:track_next: Skipping song...`);
                            updatedQueue.resetVotes((err) => {
                                if (err) {
                                    return cb(err);
                                }
                                skipSong(msg, voiceConnection, cb);
                            });
                        } else {
                            msg.channel.send(`${success} Vote successfully added.`);
                        }
                    });
                });
            });
        }
    });
}

function stopPlaying(msg, voiceConnection, cb) {
    voiceConnection.dispatcher.end('stop');
    clearQueuesAndSongs(msg, msg.guild.id, (err) => {
        if (err) {
            return cb(err);
        }
        cb();
    });
}

function setRepeat(msg, cb) {
    queueModel.findOne({ guildId: msg.guild.id }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        Queue.setRepeat((err, repeatState) => {
            if (err) {
                return cb(err);
            }
            cb(err, repeatState);
        });
    });
}

function clearQueuesAndSongs(msg, guildId, cb) {
    queueModel.deleteOne({ guildId: guildId }, (err) => {
        if (err) {
            logger.info(`Error in deleting songs in Guild: ${msg.guild.name} ID:${guildId}`);
            return cb(err);
        }
        songModel.deleteMany({ guildId: guildId }, (err) => {
            if (err) {
                logger.error(`Error in deleting songs in Guild: ${msg.guild.name} ID:${guildId}`);
                return cb(err);
            }
            logger.info(`Deleted all songs in Guild: ${msg.guild.name} ID:${guildId}`);
            cb();
        });
    });
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
        var song = {
            guildId: msg.guild.id,
            title: data.title,
            duration: data.duration,
            addedBy: msg.author.tag,
            addedByAvatar: msg.author.avatarURL,
            url: data.url,
            thumbnail: data.thumbnail
        };
        logger.info(`Saved song: ${song.title} to the database.`);
        cb(null, song);
        /*
        song.save((err) => {
            if (err) {
                return cb(err);
            }
            logger.info(`Saved song: ${data.title} to the database.`);
        });*/
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
    dispatcher.on('end', (reason) => {
        if (reason !== "stop") {
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
                    msg.channel.send(`${success} No more songs to play. Exited the channel.`);
                    cb();
                }
            });
        } else {
            voiceConnection.disconnect();
            voiceConnection.channel.leave();
            msg.channel.send(`${success} Exited the channel.`);
        }
    });
}

function removeOldestSong(guildId, cb) {
    queueModel.findOne({ guildId: guildId }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        if (Queue.repeat) {
            cb(null, Queue.songs);
        } else {
            Queue.removeOldest((err, updatedSongs) => {
                if (err) {
                    return cb(err);
                }
                cb(null, updatedSongs);
            });
        }
    });
}

function currentSong(msg, cb) {
    queueModel.findOne({ guildId: msg.guild.id }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        var currentSong = Queue.songs[0];
        var songEmbed = new Discord.RichEmbed({
            author: {
                name: "Now Playing", 
                icon_url: currentSong.addedByAvatar
            },
            title: currentSong.title,
            url: currentSong.url,
            thumbnail: {
                'url': currentSong.thumbnail
            },
            fields: [
                {
                    name: 'Added By',
                    value: currentSong.addedBy,
                    inline: true
                },
                {
                    name: 'Duration',
                    value: currentSong.duration,
                    inline: true
                }
            ]
        });
        songEmbed.setColor('GREEN');
        msg.channel.send(songEmbed);
    });
}

function serverQueue(msg, cb) {
    var guildId = msg.guild.id;
    queueModel.findOne({ guildId: guildId }, (err, Queue) => {
        if (err) {
            return cb(err);
        }
        var songsArray = [];       
        Queue.songs.forEach((song) => {
            songsArray.push({
                name: song.title,
                value: `${song.duration}`,
                inline: false
            });
        });
        var queueEmbed = new Discord.RichEmbed({
            fields: songsArray
        });
        queueEmbed.setColor('GREEN');
        msg.channel.send(queueEmbed);
        cb();
    });
}

module.exports = {
    "playSongFirst": playSongFirst,
    "addSong": addSong,
    "addSkipVote": addSkipVote,
    "skipSong": skipSong,
    "stopSong": stopPlaying,
    "setRepeat": setRepeat,
    "currentSong": currentSong,
    "serverQueue": serverQueue
}