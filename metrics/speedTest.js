const EventEmitter = require('events');
const speedTest = require('speedtest-net');

class SpeedMonitor extends EventEmitter {
	constructor(checkInterval, maxTime, serverId) {
		super();
		this._checkInterval = checkInterval;
		this._maxTime = maxTime;
		this._serverId = serverId;
	}

	start() {
		if (this.interval) {
			throw new Error('Must stop first.');
		}
		this.interval = setInterval(this._runCheck.bind(this), this._checkInterval);
		this._runCheck();
	}

	stop() {
		if (!this.interval) {
			throw new Error('Must start first.');
		}
		clearInterval(this.interval);
		this.interval = null;
	}

	async _runCheck() {
		const test = speedTest({maxTime: this._maxTime, serverId: this._serverId});
		const time = new Date();
		test.on('data', data => {
			this.emit('speed', {
				recorded: time,
				download: data.speeds.download,
				upload: data.speeds.upload,
				ping: data.server.ping,
				serverId: data.server.id
			});
		});
		test.on('error', () => {
			this.emit('speed', {
				recorded: time,
				download: 0,
				upload: 0,
				ping: 0,
				serverId: -1
			});
		});
	}
}

module.exports = SpeedMonitor;
