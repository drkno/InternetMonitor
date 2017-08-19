const Datastore = require('nedb');
const fs = require('fs');
const path = require('path');

class Database {
	constructor (filename, rotationPeriod) {
		if (!filename) {
			filename = void(0);
		}
		else {
			filename = path.resolve(filename);
		}
		this._filename = filename;
		this._db = new Datastore({
			filename: filename,
			autoload: true
		});
		this._rotateInterval = setInterval(this._rotate.bind(this), rotationPeriod);
	}

	_rotate () {
		console.log(`Rotating database ${this._filename}.`);
		try {
			delete this._db;
			if (fs.statSync(this._filename).isFile()) {
				fs.unlinkSync(this._filename);
				fs.writeFileSync(this._filename, '', 'utf8');
			}
			this._db = new Datastore({
				filename: this._filename,
				autoload: true
			});
		}
		catch(e){}
	}

	insert (document) {
		console.log(`Inserting new document into ${this._filename}.`);
		this._db.insert(document);
	}

	find (...args) {
		this._db.find(...args);
	}

	close () {
		clearInterval(this._rotateInterval);
		delete this._db;
	}
}

module.exports = Database;
