const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const tsFormat = () => (new Date()).toLocaleTimeString();

module.exports = new (winston.Logger) ({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new(winston.transports.File)({
            filename: `${logDir}/results.log`,
            timestamp: tsFormat,
            level: env === 'development' ? 'debug' : 'info',
            options: {
                flags: 'w'
            },
        })
    ]
});