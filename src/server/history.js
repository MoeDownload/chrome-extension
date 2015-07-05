import server from 'mutils/rpc/server';
import storage from 'mutils/storage';

let cachedHistory = {};

server.methods.historySet = function historySet({site, id, data}) {
	console.log(site, id, data);
	if (!cachedHistory[site]) {
		cachedHistory[site] = {};
	}
	cachedHistory[site][id] = data;

	return storage.set({history: cachedHistory});
};

server.methods.historyCheck = function historyCheck({site, id}) {
	return !!(cachedHistory[site] || {})[id];
};

storage.get('history', function setInitial({history = {}}) {
	cachedHistory = history;
});
