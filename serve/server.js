const path = require('path');
const express = require('express');
const app = express();

class Server {
	constructor (port, staticFilesDirectory, speedDb, onlineDb) {
		this._app = express();
		this._app.get('/api/v1/speed', this._speedApi.bind(this));
		this._app.get('/api/v1/online', this._onlineApi.bind(this));
		this._app.use('/node_modules', express.static(path.resolve('./node_modules')));
		this._app.use(express.static(path.resolve(staticFilesDirectory)));
		this._port = port;

		this._speedDb = speedDb;
		this._onlineDb = onlineDb;
	}

	_speedApi (req, res) {
		this._speedDb.find({}, (e, doc) => {
			const result = {
				success: !e,
				data: e || doc
			};
			res.set('Content-Type', 'application/json');
			res.send(result);
		});
	}

	_onlineApi (req, res) {
		this._onlineDb.find({}, (e, doc) => {
			const result = {
				success: !e,
				data: e || doc
			};
			res.set('Content-Type', 'application/json');
			res.send(result);
		});
	}

	start () {
		this._server = this._app.listen(this._port, () => {});
	}

	stop() {
		this._server.close();
	}
}

module.exports = Server;
