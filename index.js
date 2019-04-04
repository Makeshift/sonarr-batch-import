const request = require('request-promise-native');
const config = require('./config.js');
const {log, fail} = require('./log')

let sonarr = (new URL(config.get("url"))).origin
log.info("Starting...", {sonarr: sonarr, logLevel: config.get("logLevel")})

async function getSeries(name) {
	log.verbose("Querying Sonarr for series", {name: name})
	let search = await request({
		url: `${sonarr}/api/series/lookup`,
		qs: {
			apikey: config.get("apikey"),
			term: name
		}
	})
	search = JSON.parse(search);
	log.debug("Search result", {result: search})
	let result = [];
	let cleanResults;
	if (search.length > 1) {
		cleanResults = search.map(found => {
			if (found.title === name) {
				log.verbose("Got exact result", {name: name})
				//result.push(found);
			}
			return {
				title: found.title,
				seasonCount: found.seasonCount,
				status: found.status,
				tvdbId: found.tvdbId
			}
		});
		if (result.length === 0) {
			result = search;
		}
	} else {
		result.push(search[0]);
	}
		
	if (result.length > 1) {
		fail.search("Multiple results found for series, not adding.", {name: name, results: cleanResults})
	} else if (result.length === 0) {
		fail.search("No matches found for series.", {name: name})
	} else {
		return result.pop();
	}
}

getSeries("Breaking Bad");