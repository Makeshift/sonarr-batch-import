const request = require('request-promise-native');
const config = require('./config.js');
const {log, fail} = require('./log');
const fs = require('fs');
const split = require('binary-split');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const path = require('path');

let sonarr = (new URL(config.get("url"))).origin
log.info("Starting...", {sonarr: sonarr, logLevel: config.get("logLevel")})

async function getSeries(name) {
	try {
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
					result.push(found);
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
	} catch(e) {
		log.error("Error searching for series.", {series: name, error: JSON.stringify(e, replaceErrors)})
		fail.search("Error searching for series.", {series: name, error: JSON.stringify(e, replaceErrors)})
	}
}

async function addSeries(series) {
	log.info("Adding series to Sonarr", {series: series});
	try {
		await request.post({
			url: `${sonarr}/api/series`,
			body: {
				tvdbId: series.tvdbId,
				title: series.title,
				qualityProfileId: config.get("profileId"),
				titleSlug: series.titleSlug,
				images: series.images,
				seasons: series.seasons
			},
			qs: {
				apikey: config.get("apikey")
			},
			json: true
		})
	} catch(e) {
		log.error("Error searching for series.", {series: series, error: JSON.stringify(e, replaceErrors)})
		fail.submit("Error searching for series.", {series: series, error: JSON.stringify(e, replaceErrors)})
	}
	return;
}

async function setQualityProfileId() {
	let profileId = config.get("profileId")
	if (typeof profileId === "undefined") {
		let wantedProfile = config.get("profile");
		log.info("Searching profiles for wanted profile", {wantedProfile: wantedProfile});
		let profiles = await request({
			url: `${sonarr}/api/profile`,
			qs: {
				apikey: config.get("apikey")
			}
		});
		profiles = JSON.parse(profiles);
		log.verbose("Got profiles", {profiles: profiles})
		
		let gotProfile;
		profiles.map(profile => {
			if (profile.name.toLowerCase() === wantedProfile.toLowerCase()) {
				log.verbose("Got profile", {profile: profile})
				gotProfile = profile;
			}
		})
		if (!gotProfile) {
			log.error("Profile not found! Set your quality 'profile' in config.json.", {expectedProfile: wantedProfile});
			process.exit(1);
		}
		profileId = gotProfile.id;
		config.set("profileId", profileId)
	}
	log.info("Profile ID set", {profileId: profileId})
}


async function getAllSeries() {
	log.verbose("Getting a list of all series", {sonarr: sonarr})
	let allSeries = await request({
		url: `${sonarr}/api/series`,
		qs: {
			apikey: config.get("apikey")
		}
	});
	allSeries = JSON.parse(allSeries);
	if (!allSeries) {
		log.error("Not able to get series list! Failing.", {sonarr: sonarr});
		process.exit(1);
	}
	let cleanSeriesList = allSeries.map(series => series.title.toLowerCase())
	log.debug("Got all series", {list: cleanSeriesList})
	return cleanSeriesList;
}

// let debugWritable = new stream.Writable({
// 	write(chunk, encoding, callback) {
// 		console.log(chunk.toString());
// 		callback(null);
// 	}
// })


//getSeries("Breaking Bad");

async function run() {
	try {
		let allSeries = await getAllSeries();
		await setQualityProfileId();
		let delimiter = config.get("delimiter");
		let listPath = path.resolve(config.get("listfile"));
		log.verbose("Path and delimiter set", {delimiter: delimiter, path: listPath});
		let splitter = split(delimiter);
		let addSeriesStream = new stream.Writable({
			async write(chunk, encoding, callback) {
				let series = chunk.toString();
				log.verbose("Checking if series is already in Sonarr", {series: series})
				if (!allSeries.includes(series.toLowerCase())) {
					log.info("Series is not in Sonarr, looking up series", {series: series})
					let got = await getSeries(series);
					if (got) {
						log.info("Got result, submitting to Sonarr", {series: series})
						await addSeries(got);
					}
				} else {
					log.verbose("Series is already in Sonarr, skipping", {series: series})
				}
				callback(null);
			}
		})
		await pipeline(
			fs.createReadStream(listPath),
			splitter,
			addSeriesStream
		)
	} catch(e) {
		log.error("Error occured.", {error: JSON.stringify(e, replaceErrors)})
	}
}

function replaceErrors(key, value) {
    if (value instanceof Error) {
        let error = {};

        Object.getOwnPropertyNames(value).forEach(function (key) {
            error[key] = value[key];
        });

        return error;
    }

    return value;
}

run();