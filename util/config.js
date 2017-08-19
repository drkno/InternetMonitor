const fs = require('fs');

class Config {
	constructor (file) {
		try {
			const data = fs.readFileSync(file, 'utf8').toString().replace(/^\uFEFF/, '');
			this._configData = JSON.parse(data);
		}
		catch(e) {
			this._configData = {};
		}
	}

	get () {
		return this._configData;
	}

	ensure (def, ...names) {
		let curr = this._configData;
		for (let i = 0; i < names.length; i++) {
			const name = names[i];
			if (i + 1 === names.length && !curr[name]) {
				curr[name] = def;
			}
			else if (!curr[name]) {
				curr[name] = {};
			}
			curr = curr[name];
		}
		return curr;
	}
}

module.exports = new Config('./../config.json');
