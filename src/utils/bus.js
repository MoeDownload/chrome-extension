/* Simple Event Bus */
import EventEmitter2 from 'eventemitter2';

module.exports = new EventEmitter2({
	wildcard: true,
	maxListeners: 20
});
