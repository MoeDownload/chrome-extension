import Rx from 'rx';
import Client from 'mutils/rpc/client';
module.exports = function (site) {
	return Rx.Observable.create(function prepare(observer) {
		if (!site.downloadEnabled) {
			console.log('Download not supported, skipping..');
			return;
		}
		Promise.join(
			site.getPages(),
			site.getWorkInfo(),
			function createFilenameObs(pages, info) {
				var _pages;
				require('mutils/config').ns(site.id, site.defaults)
				.map(R.prop('template')).subscribe(function (template) {
					_pages = require('mutils/filename')(pages, info, template);
					observer.onNext(_pages);
				});

				EventBus.on('download', function (checkedPages) {
					if (checkedPages.length !== _pages.length) {
						throw new Error('Page length mismatch');
					}

					// http://ramdajs.com/0.15/docs/#zip
					checkedPages = R.zip(_pages, checkedPages)
					.filter(p => p[1]).forEach(function ([{url, filename}]) {
						Client.call('download', {
							url,
							filename,
							referer: document.location.toString()
						});
					});
				});
			}
		);
	});
};
