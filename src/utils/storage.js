import Rx from 'rx';
const local = chrome.storage.local;

/* eslint-disable func-names */
function get(keys) {
	return new Promise(function(resolve, reject) {
		local.get(keys, function (items) {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items);
		});
	});
}

function set(items) {
	return new Promise(function(resolve, reject) {
		local.set(items, function () {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve();
		});
	});
}

function remove(keys) {
	return new Promise(function(resolve, reject) {
		local.remove(keys, function () {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve();
		});
	});
}

const changes = Rx.Observable.create(observer => {
	chrome.storage.onChanged.addListener(observer.onNext.bind(observer));
});

module.exports = {
	get,
	set,
	remove,
	changes,
};
