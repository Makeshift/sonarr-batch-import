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

| Key       | Description                                                        | Optional | Default Value         |
|-----------|--------------------------------------------------------------------|----------|-----------------------|
| url       | The URL of your Sonarr instance                                    | No       |                       |
| apikey    | The API key for Sonarr                                             | No       |                       |
| listfile  | A list of series, delimited by something                           | Yes      | "series.txt"          |
| logLevel  | Logging levels available `info`, `verbose`, `debug`.               | Yes      | "info"                |
| profile   | Name of the profile you want to add the series to                  | Yes      | "HD - 720p/1080p"     |
| profileId | If you know the ID of the profile you want, we can skip the lookup | Yes      | Gathered from profile |
| delimiter | The delimiter that separates each series in your file              | Yes      | os.EOL                |

## Setup

* Specify your config via arguments, environment variables or `config.json`
* `git clone https://github.com/Makeshift/sonarr-batch-import.git`
* `npm install`
* `node index.js`
