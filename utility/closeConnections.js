const logger = require('./logger');
const mongoose = require('mongoose');
const queueModel = require('../DB/queue.js');
const songModel = require('../DB/song.js');

function closeConnections(bot) {
    if (bot.voiceConnections.size) {
        queueModel.deleteMany({}, (err) => {
            if (err) {
                logger.error('Error in deleting the Queues.');
            } else {
                logger.info('Deleted all Queues.');
            }
            songModel.deleteMany({}, (err) => {
                if (err) {
                    logger.error('Error in deleting the Songs.');
                } else {
                    logger.info('Deleted all Songs.');
                }
                mongoose.disconnect();
                bot.voiceConnections.map((voiceConnection) => {
                    voiceConnection.disconnect();
                    voiceConnection.channel.leave();
                    logger.info(`disconnected from ${voiceConnection.channel.id}`);
                    process.exit(0);
                });
            });
        });
    } else {
        console.log('\n');
        queueModel.deleteMany({}, (err) => {
            if (err) {
                logger.error('Error in deleting the Queues.');
            } else {
                logger.info('Deleted all Queues.');
            }
            songModel.deleteMany({}, (err) => {
                if (err) {
                    logger.error('Error in deleting the Songs.');
                } else {
                    logger.info('Deleted all Songs.');
                }
                mongoose.disconnect();
                process.exit(0);
            });
        });
    }
}

module.exports = closeConnections;