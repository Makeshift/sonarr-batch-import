const nconf = require('nconf');

nconf
.argv()
.env()
.file({ file: 'config.json'})
.required(["url", "apikey"])

nconf.defaults({
	listfile: "series.txt",
	logLevel: "info"
})

module.exports = nconf;