//
// Server side
//
(() => {
	'use strict';

	const CatDB = require('./lib/cat-db/cat-db.js');
	
	class CatDBApp {
		constructor() {
			this._Ack = (param) => {
				return Promise.resolve()
				.then(() => {
					console.log("Send Ack", param);
					return this._messageCenter.sendEvent('cat-db#Ack', {scopes: ['public']}, param);
				});
			}

			this._Ping = (metadata, data) => {
				return this._Ack({type: 'ping'})
				.then(() => {
					const stamp = new Date().toString();;
					console.log('Ping received: ' + stamp);
					return Promise.resolve('ping received(' + stamp + ')');
				})
				.catch((err) => {
					console.error(err);
				});
			}

			this._Clear = (metadata, data) => {
				return this._Ack({type: 'clear'})
				.then(() => {
					console.log("Clear received");
					return Promise.resolve("clear received");
				})
				.then(() => {
					return this._CatDB.clear();	
				})
				.catch((err) => {
					console.error(err);
				});
			}

			this._CatDB = new CatDB();

			this._messageCenter = {};
			this._messenger = new global.helper.Messenger();
			this._messenger.addEventListener('base#Base initialized', {scopes: null}, this.onInitialized);
			this._messenger.addRequestListener('cat-db#Ping', {scopes: ['public']}, this._Ping);
			this._messenger.addRequestListener('cat-db#Clear', {scopes: ['cat-db-admin']}, this._Clear);
		}

		getBitsSystemId(messageCenter) {
			return messageCenter.sendRequest('base#System bitsId')
			.then((systemId) => {
				console.log(`BITS id is ${systemId}.`);
				this._systemId = systemId;
			})
			.catch((err) => {
				console.error('Failed to get the BITS id:', err);
			});
		}

		onInitialized() {
			console.log('Base is initialized');
		}

		onClientInitialized() {
			console.log('Client is initialized');
		}

		load(messageCenter) {
			console.log('Cat DB initialized.');
			this._messageCenter = messageCenter;
			return this.getBitsSystemId(messageCenter)
			.then(() => {
				this._messenger.load(messageCenter);
			})
			.then(() => {
				this._CatDB.load(messageCenter);
				
			})
			.catch((err) => {
				console.error('Failed to load messenger:', err);
			});
		}

		unload() {
			console.log('Goodbye!');
			return Promise.resolve()
			.then(() => this._CatDB.unload())
			.then(() => this._messenger.unload());
		}
	}

	module.exports = new CatDBApp();
})();
