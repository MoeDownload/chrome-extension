import Rx from 'rx';
import storage from './storage.js';
var subject = new Rx.BehaviorSubject({});

function toConfigObject(items) {
	var ret = {};
	for (let key in items) {
		if (items.hasOwnProperty(key)) {
			// Config key is like conifg:pixiv
			let matched = /^config:(.+)$/.exec(key);

			if (matched !== null) {
				ret[matched[1]] = items[key];
			}
		}
	}
	return ret;
}

storage.get(null).then(function setInitial(items = {}) {
	subject.onNext(toConfigObject(items));
});


storage.changes.subscribe(function mergeChanges(changes) {
	changes = R.mapObj(change => change.newValue)(changes);
	changes = toConfigObject(changes);

	// Merge changed values to original
	subject.onNext(R.merge(subject.getValue(), changes));
});

subject.ns = function ns(namespace, defaultTo = {}) {
	return subject.select(function getByNamespace(config) {
		return R.merge(defaultTo, config[namespace]);
	});
};

export default subject;
