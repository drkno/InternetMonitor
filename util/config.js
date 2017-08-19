const fs = require('fs');
const path = require('path');

class Config {
	constructor (file) {
		try {
			const data = fs.readFileSync(path.resolve(file), 'utf8').toString().replace(/^\uFEFF/, '');
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
		console.log(`Getting config for ${names.join('.')} = (${typeof(curr)}) ${JSON.stringify(curr)}`);
		return curr;
	}
}

module.exports = new Config('./config.json');
