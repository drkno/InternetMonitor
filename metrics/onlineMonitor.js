const EventEmitter = require('events');
const isOnline = require('is-online');

class OnlineMonitor extends EventEmitter {
	constructor(checkInterval, timeout = 800) {
		super();
		this.checkInterval = checkInterval;
		this.timeout = {
			timeout: timeout
		};
	}

	start() {
		if (this.interval) {
			throw new Error('Must stop first.');
		}
		this.last = true;
		this.outageStarted = null;
		this.interval = setInterval(this._runCheck.bind(this), this.checkInterval);
	}

	stop() {
		if (!this.interval) {
			throw new Error('Must start first.');
		}
		clearInterval(this.interval);
		this.interval = null;
	}

	async _runCheck() {
		let online = true;
		try {
			online = await isOnline(this.timeout);
		}
		catch (e) {
			online = false;
		}
		if (!online && this.last) {
			this.outageStarted = new Date();
			this.last = false;
		}
		else if (online && !this.last) {
			const outageEvent = {
				start: this.outageStarted,
				end: new Date()
			};
			if (outageEvent.end - outageEvent.start > 1000) {
				this.emit('outage', outageEvent);
			}
			this.last = true;
			this.outageStarted = null;
		}
	}
}

module.exports = OnlineMonitor;
