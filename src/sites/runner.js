var sites = (function() {
	// Get all sites in ./sites using webpack's context.
	var context = require.context('./sites', false, /[^_]\.js$/);
	return context.keys().map(context);
}());
console.log('%d sites found', sites.length);

// Find first supported one. site.enabled should be getter.
var current = R.find(R.propEq('enabled', true))(sites);
console.log('Current enabled', current);

exports.pageObservable = require('./download')(current);
