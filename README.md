## Internet Monitor
A small status tool to monitor the speed (up/down/ping) of your internet connection. Will also monitor for and record internet outages.

#### Installation
```
curl -sL https://raw.githubusercontent.com/mrkno/InternetMonitor/master/install.sh | sudo -E bash -
```

#### Configuration
Create a `config.json` file within `/opt/InternetMonitor` and add the following JSON values (all optional):

- `onlineCheckDb`: database to store outage data (default=`online.db`)
- `speedTestDb`: database to store speed test data (default=`speed.db`)
- `dbRotationPeriod`: delete data in DBs after this number of ms (default=`2147483647`)
- `onlineCheckInterval`: frequency to check if the internet is connected in ms (default=`5000`)
- `onlineCheckTimeout`: timout before an internet outage is declared in ms (default=`500`)
- `speedTestInterval`: frequency to check the internet speed in ms (default=`300000`)
- `speedTestMaxTime`: maximum time to spend checking internet speed in ms (default=`60000`)
- `speedTestServerId`: speedtest.net server ID to test against, leave blank to autoselect (default=`undefined`)
- `serverPort`: server port to display dashboard and host api on (default=`8080`)
- `serverStaticFilesDirectory`: directory to serve static content from (default=`/opt/InternetMonitor/serve/static`)

#### API
- `/api/v1/speed` - get all speed test data in date/time order
- `/api/v1/online` - get all internet outages in date/time order