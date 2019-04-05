# Mass importing of TV series into Sonarr

A relatively simple to configure script that will mass-add a list of TV series into Sonarr.

## Config

This project uses [nconf](https://github.com/indexzero/nconf), so settings can be supplied via arguments, environment variables or a `config.json` file. I personally use a `config.json`, like this:

```json
{
   "url": "http://media:8989",
   "apikey": "158u9aohfnaofwa987124gh",
   "logLevel": "info",
   "profile": "any",
   "listfile": "series.txt",
   "profileId": 1,
   "delimiter": "\n"
}
```

My `series.txt` is simply a list of series names delimited by newline.

| Key       | Description                                                        | Optional | Default Value         |
|-----------|--------------------------------------------------------------------|----------|-----------------------|
| url       | The URL of your Sonarr instance                                    | No       |                       |
| apikey    | The API key for Sonarr                                             | No       |                       |
| listfile  | A list of series, delimited by something                           | Yes      | "series.txt"          |
| logLevel  | Logging levels available `info`, `verbose`, `debug`.               | Yes      | "info"                |
| profile   | Name of the profile you want to add the series to                  | Yes      | "HD - 720p/1080p"     |
| profileId | If you know the ID of the profile you want, we can skip the lookup | Yes      | Gathered from profile |
| delimiter | The delimiter that separates each series in your file              | Yes      | os.EOL                |
| rootFolderId | The ID of the rootFolder to override the auto-detection, may be required if you have multiple root folders | Kind of? | If you have only one root folder, it will use it. Otherwise, specify the ID of the one you want to use.
| ignoreEpisodesWithFiles | See [Sonarr Series API](https://github.com/Sonarr/Sonarr/wiki/Series) | Yes | false |
| ignoreEpisodesWithoutFiles | See [Sonarr Series API](https://github.com/Sonarr/Sonarr/wiki/Series) | Yes | false |
| searchForMissingEpisodes | See [Sonarr Series API](https://github.com/Sonarr/Sonarr/wiki/Series) | Yes | true |

## Setup

* Specify your config via arguments, environment variables or `config.json`
* `git clone https://github.com/Makeshift/sonarr-batch-import.git`
* `npm install`
* `node index.js`

## Error handling

There is a decent chunk of logic dedicated to handling duplicate results.

* If you request a TV series that responds with multiple series, it will automatically pick the one that matches the exact name.
* If there is no exact name match (or multiple exact name matches) then it will output all results to `logs/searchFailures.log`. You can then replace the entry with the TVDBID for an exact match. (? Untested)
* If we fail to submit a series to Sonarr, we'll log it out to `logs/addFailures.log` where you can review and retry.
* It is safe to retry adding series, as it will skip series that Sonarr already has.
* `logs/run.log` will always contain a debug output of the program run. If you wish to submit an issue, please include it.

Thanks!

