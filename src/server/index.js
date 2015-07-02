import '../bootstrap';
import server from 'mutils/rpc/server';
import './network';
import './analytics.js';
import {extname} from 'path';

server.methods.download = function download({url, filename, referer}) {
	window.ga('send', 'event', 'server', 'download');

	filename += extname(url);

	return;
	chrome.downloads.download({
		url,
		filename,
		headers: [
			{
				name: 'X-Referer',
				value: referer
			}
		]
	});
};
