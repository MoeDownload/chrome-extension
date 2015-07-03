/**
 * RPC Client
 */

import {EventEmitter} from 'events';

/**
 * Emitter to receive message from server
 */
var emitter = new EventEmitter();
chrome.runtime.connect().onMessage.addListener(function handleEvent(message) {
	emitter.emit(message.event, message.data);
});
module.exports = emitter;

/**
 * Call an remote method
 * @param  {String} method Method name
 * @param  {Any} data   payload
 * @return {Promise}
 */
emitter.call = function callRemote(method, data) {
	return new Promise(function request(resolve, reject) {
		chrome.runtime.sendMessage({method, data}, function handleResponse(response) {
			if (response.status === 'success') {
				resolve(response.value);
			} else {
				reject(response.reason);
			}
		});
	});
};
