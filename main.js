const Config = require('./util/config.js');
const Database = require('./util/database.js');
const Server = require('./serve/server.js');
const OnlineMonitor = require('./metrics/onlineMonitor.js');
const SpeedMonitor = require('./metrics/speedTest.js');

const onlineCheckDb = new Database(
	Config.ensure('online.db', 'onlineCheckDb'),
	Config.ensure(2147483647, 'dbRotationPeriod')
);
const onlineMonitor = new OnlineMonitor(
	Config.ensure(5000, 'onlineCheckInterval'),
	Config.ensure(500, 'onlineCheckTimeout')
);
onlineMonitor.on('outage', details => {
	onlineCheckDb.insert(details);
});

const speedTestDb = new Database(
	Config.ensure('speed.db', 'speedTestDb'),
	Config.ensure(2147483647, 'dbRotationPeriod')
);
const speedMonitor = new SpeedMonitor(
	Config.ensure(300000, 'speedTestInterval'),
	Config.ensure(60000, 'speedTestMaxTime'),
	Config.ensure(void(0), 'speedTestServerId')
);
speedMonitor.on('speed', details => {
	speedTestDb.insert(details);
});

const server = new Server(
	Config.ensure(8080, 'serverPort'),
	Config.ensure('./serve/static', 'serverStaticFilesDirectory'),
	speedTestDb,
	onlineCheckDb
);

process.on('exit', () => {
	console.log('Shutting down.');

	server.stop();

	onlineMonitor.stop();
	onlineCheckDb.close();

	speedTestDb.stop();
	speedTestDb.close();

	process.exit(0);
});

onlineMonitor.start();
speedMonitor.start();
server.start();
