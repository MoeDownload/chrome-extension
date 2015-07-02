module.exports = {
	get defaults(){
		return {
			template: '?user_name? - ?title? (?id?@?user_id?)[?tags?]?[ ?page?P]?'
		};
	},
	get enabled(){
		return document.location.host === 'www.pixiv.net';
	},

	get downloadEnabled(){
		var loc = document.location.toString();

		return !!(loc.match(/member_illust\.php\?/) &&
		loc.match(/(?:&|\?)mode=medium(?:&|$)/) &&
		loc.match(/(?:&|\?)illust_id=\d+(?:&|$)/));
	},

	async getPages(){
		// 由于API权限不足，无法获取R-18作品数据（即使已经登录且设置允许R-18）
		// 暂时不使用API方式，改用DOM + AJAX
		var pages = [];
		if ($('._illust_modal').length !== 0) {
			// 对于单张图片，可以直接在页面上的._illust_modal当中找到URL
			let url = $('.original-image').data('src');
			pages.push(url);
		} else if ($('._ugoku-illust-player-container').length !== 0) {
			// Ugoira（动图）
			// 由于Chrome的限制，内容脚本无法访问window.pixiv，因此只能使用注入脚本+共享DOM
			await new Promise(function injectAndReceive(resolve) {
				var $window = $(window);
				function handleMessage(msg) {
					if (!msg.data.fullscreenSrc) {
						return;
					}

					pages.push(msg.data.fullscreenSrc);
					// Unsubscribe to prevent errors
					$window.off('message', handleMessage);
					resolve();
				}
				$window.on('message', handleMessage);

				// pixiv.context.ugokuIllustFullscreenData.src就是大图zip地址，
				// 这里以fullscreenSrc回传
				$.globalEval(`
					window.postMessage({
						fullscreenSrc: pixiv.context.ugokuIllustFullscreenData.src
					}, "*");
				`);
			});
		} else if ($('.multiple').length !== 0) {
			// 漫画等
			// 原本可以直接使用$(html)的方式构建DOM树进行解析，但是这样做会导致不必要的资源浪费
			// （浏览器会把所有页面的引用资源下载下来，即使没有插入进document）
			const {Parser} = require('htmlparser2');
			const mangaUrl = document.location.toString().split('medium').join('manga');

			let mangaHtml = await $.get(mangaUrl);
			// 获取所有到大图查看页的地址
			// 另外一种实现方式是直接通过缩略图地址和正则表达式替换获取大图地址，但稳定性不好
			let mangaBigLinks = await new Promise(function (resolve, reject) {
				var links = [];
				var p = new Parser({
					onopentag: function (name, attrib) {
						if (name === 'a' && attrib.class && attrib.class.includes('full-size-container')) {
							links.push(attrib.href);
						}
					},
					onend: function () {
						resolve(links);
					},
					onerror: reject
				}, {decodeEntities: true});
				// 始终设置decodeEntities: true，
				// 原因见https://github.com/fb55/htmlparser2/issues/105

				p.write(mangaHtml);
				p.end();
			});

			pages = await Promise.all(mangaBigLinks.map(async function (link) {
				var html = await $.get(link);

				return await new Promise(function (resolve, reject) {
					var p = new Parser({
						onopentag: function (name, attrib) {
							// 暂时认为每个页面第一个img就是大图
							if (name === 'img') {
								resolve(attrib.src);
							}
						},
						onerror: reject
					}, {decodeEntities: true});

					p.write(html);
					p.end();
				});
			}));
		}
		return pages;
	},
	getWorkInfo(){
		/* eslint-disable camelcase */
		var info = {};

		function text(selector) {
			return $(selector).text();
		}

		function extractText() {
			return $(this).text();
		}

		info.id = /illust_id=(\d+)/.exec(document.location)[1];

		info.title = text('.work-info .title');

		info.created = Number(new Date(text('.meta > li:eq(0)')));

		info.tags = $('.tags > .tag > .text')
			.map(extractText).get(); // 使用get取得正常JS数组，否则返回的是jQuery对象

		info.user_name = text('.user');

		info.user_id = /\?id=(\d+)/.exec($('.user-link').attr('href'))[1];

		info.user_account =
			/\/profile\/(.+?)\//.exec($('.user-image').attr('src'))[1];

		info.tools = $('.tools > li').map(extractText).get();

		return info;
	}
};
