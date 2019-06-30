const logger = require('../utility/logger');
const config = require('../config/config.json');
const fail = config.fail_emoji;

function execute(msg) {
    msgSplit = msg.content.split(' ');
    spamContent = msgSplit[1, msgSplit.length-2];

    try {
        spamCounter = parseInt(msgSplit[msgSplit.length-1]);
    } catch (err) {
        msg.channel.send(`${fail} Invalid spam count.`);
        logger.error('Invalid spam count.');
    }

    if (spamCounter > 100) {
        msg.channel.send(`${fail} Sorry, 100 spam is the maximum.`);
        logger.info('Maximum spam breached.');
    }

    while (spamCounter > 0) {
        msg.channel.send(spamContent);
        spamCounter--;
    }

    logger.info(`Spammed "${spamContent}" ${spamCounter} times.`);
}

module.exports = {
    "name": "spam",
    "execute": execute
}