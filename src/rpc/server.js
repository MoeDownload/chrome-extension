/**
 * RPC Server
 */

/**
 * Exported methods. Use require('./rpc').methods.name = function(){...} to export a new method.
 * @type {Object}
 */
var methods = {};
exports.methods = methods;

chrome.runtime.onMessage.addListener(function handleRequest(request, sender, sendResponse) {
	new Promise(function (resolve, reject) {
		if (request.method && methods[request.method]) {
			resolve(Promise.try(methods[request.method], request.data));
		} else {
			reject(new Error('Invalid request'));
		}
	})
	.reflect()
	.then(function (status) {
		if (status.isFulfilled()) {
			sendResponse({
				status: 'success',
				value: status.value()
			});
		} else { // Rejected
			sendResponse({
				status: 'rejected',
				reason: status.reason()
			});
		}
	});

	return true; // Return true becasue we always want to send response asynchronously
});

/**
 * Clients' unique set.
 * @type {Set<Port>}
 */
var clients = new Set();

chrome.runtime.onConnect.addListener(function(port) {
	clients.add(port);

	port.onDisconnect.addListener(function () {
		clients.delete(port);
	});
});

/**
 * Boradcast an event to all connected clients
 * @param  {String} event Event name
 * @param  {Any} data  External data
 */
exports.broadcast = function broadcast(event, data) {
	clients.forEach(function (client) {
		client.postMessage({event, data});
	});
};
