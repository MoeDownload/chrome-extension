chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	var headers = details.requestHeaders.map(header => {
		if (header.name !== 'X-Referer') {
			return header;
		}
		header.name = 'Referer';
		return header;
	});
	return {
		requestHeaders: headers
	};
}, {
	urls: ['<all_urls>'],
	tabId: -1
}, ['blocking', 'requestHeaders']);
