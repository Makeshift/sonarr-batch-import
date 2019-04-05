const nconf = require('nconf');
const os = require('os');

nconf
    .argv()
    .env()
    .file({
        file: 'config.json'
    })
    .required(["url", "apikey"])

nconf.defaults({
    listfile: "series.txt",
    logLevel: "info",
    profile: "HD - 720p/1080p",
    profileId: undefined,
    delimiter: os.EOL,
    rootFolderId: null,
    rootFolder: null,
    searchForMissingEpisodes: true,
    ignoreEpisodesWithFiles: false,
    ignoreEpisodesWithoutFiles: false
})

module.exports = nconf;