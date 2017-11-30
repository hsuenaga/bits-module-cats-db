(() => {
	'use strict';

	const CrudManager = global.helper.CrudManager;

	class CatDBManager extends CrudManager {
		constructor() {
			super('catdb#CatDBManager', {readScopes: ['public'], writeScopes: ['public']});
		}

		validate(cat) {
			return super.validate(cat)
			.then((cat) => {
				console.log("Validating cat", cat);
				if (cat.type === undefined || cat.type === null) {
					return Promise.reject("Invalid Type");
				}
				if (typeof(cat.name) !== 'string') {
					return Promise.reject("Name must be a string");
				}
				if (cat.name.length === 0) {
					return Promise.reject("Empty name");
				}
				if (cat.age === undefined || cat.age === null) {
					return Promise.reject("No Age");
				}
				return Promise.resolve(cat);
			});
			
		}
	}

	class CatDB {
		constructor() {
			this._CatDBManager = new CatDBManager();
		}

		load(messageCenter) {
			return Promise.resolve()
			.then(() => this._CatDBManager.load(messageCenter));
		}

		unload(messageCenter) {
			return Promise.resolve()
			.then(() => this._CatDBManager.unload(messageCenter));
		}

		clear() {
			const mgr = this._CatDBManager;

			return mgr.list()
			.then((list) => {
				if (!list || list.length == 0) {
					console.log("No more entry");
					return Promise.resolve();
				}

				const item = list[0];
				console.log("delete entry: ", item);
				return mgr.delete(item.id)
				.then(() => {
					this.clear();
				});
			})
			.catch((err) => {
				console.error("Error: ", err);
			});
		}
	}

	module.exports = CatDB;
})();
