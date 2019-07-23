const logger = require('../utility/logger');
const config = require('../config/config.json');
const fail = config.fail_emoji;

function execute(msg) {
    var msgSplit = msg.content.split(' ');
    var spamContent = msgSplit.slice(1, msgSplit.length-1);
    spamContent = spamContent.join(' ');

    try {
        var spamCounter = parseInt(msgSplit[msgSplit.length-1]);
        var spamCount = spamCounter;
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

    logger.info(`Spammed "${spamContent}" ${spamCount} times.`);
}

module.exports = {
    "name": "spam",
    "execute": execute
}