const { createLogger, format, transports } = require('winston');
const { combine, json, timestamp, printf, splat, colorize } = format;
const config = require('./config');
const tty = require('tty');
const { SPLAT } = require('triple-beam');
const { highlight } = require('cli-highlight');

function formatForTTY() {
    if (tty.isatty(process.stdout.fd)) {
        return combine(colorize(), timestamp(), json(), cliFormat)
    } else {
        return combine(timestamp(), splat(), json());
    }
}

const cliFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message} - ${info[SPLAT] ? highlight(JSON.stringify(info[SPLAT], null, 2), {language: 'json', ignoreIllegals: true}) : ""}`;
});

const logfileFormat = printf(info => {
    return `${info.level}: ${info.message} - ${info[SPLAT] ? JSON.stringify(info[SPLAT], null, 2) : null}`;
});

const log = createLogger({

    transports: [
        new transports.Console({
            timestamp: true,
            showLevel: true,
            level: config.get("logLevel"),
            format: formatForTTY()
        }),
        new transports.File({
            filename: `logs/run.${getDate()}.log`,
            format: combine(json(), logfileFormat),
            level: "debug"
        })
    ]
});

const fail = createLogger({
    levels: {
        info: 0,
        submit: 1,
        search: 2,
        verbose: 3,
        debug: 4
    },
    transports: [
        new transports.File({
            filename: `logs/searchFailures.${getDate()}.log`,
            level: "search",
            format: combine(json(), logfileFormat)
        }),
        new transports.File({
            filename: `logs/addFailures.${getDate()}.log`,
            level: "submit",
            format: combine(json(), logfileFormat)
        }),
        new transports.Console({
            timestamp: true,
            format: formatForTTY(),
            showLevel: true,
            level: "info"
        })
    ]
})

function getDate() {
    let d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}T${d.getHours()}.${d.getMinutes()}.${d.getSeconds()}`
}

module.exports = {
    log: log,
    fail: fail
};