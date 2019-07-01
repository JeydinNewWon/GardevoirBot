const fs = require('fs');
const config = require('../config/config.json');
const fail = config.fail_emoji;
const logger = require('./logger');
const path = require('path');

var commands = {};

function loadCommands() {
    fs.readdir(path.join(__dirname, "../commands"), (err, files) => {
        if (err) {
            logger.error("Failed to load commands: " + err.message);
            return;
        }

        for (var file of files) {
            if (file.endsWith('.js')) {
                var command = require(path.join(__dirname, `../commands/${file}`));
                commands[command.name] = command;
            }
        }
        
        logger.info(`Loaded commands ${Object.keys(commands).join(', ')}`);
        saveCommands(commands);
    });

}

function checkCommand(msg) {
        var commandName = msg.content.substr(msg.prefix.length).split(' ')[0];
        var command = commands[commandName];

        if (!command) {
            msg.channel.send(`${fail} Sorry, that command is invalid.`).then((message) => {
                setTimeout(() => {
                    message.delete();
                }, 2000);
            });
            return;
        }

        command.execute(msg);
    
    /*catch (err) {
        logger.error("Error occured in running command: " + err.message);
    }*/
}

function init() {
    loadCommands();
}

function saveCommands(t) {
    commands = t;
}


module.exports = {
    "init": init,
    "checkCommand": checkCommand,
    "saveCommands": saveCommands
}