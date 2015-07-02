const DELIM = '__DELIM__';

module.exports = function (pages, info, template) {
	var keys = R.keys(info);
	pages = R.clone(pages);
	info = R.clone(info);
	template = template.replace(/\/|\\/g, DELIM); // Replace / and \ with DELIM

	info.page = 0;
	keys.push('page');

	if (pages.length === 1) {
		template = template.replace(/\?\[.*?\]\?/g, '');
	} else {
		template = template.replace(/\?\[(.*?)\]\?/g, '$1');
	}

	pages = pages.map(function (page) {
		var filename = template;

		info.page += 1;

		keys.forEach(function (key) {
			var value = info[key];
			if (Array.isArray(value)) {
				value = value.join(' ');
			}
			filename = filename.split(`?${key}?`).join(value);
		});

		return {
			url: page,
			// http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
			filename: filename.replace(/[\|\\/:*?"<>]/g, '').split(DELIM).join('/')
		};
	});

	return pages;
};
