import IntlMessageFormat from 'intl-messageformat';

module.exports = function translate(msgid, data) {
	var msg = chrome.i18n.getMessage(msgid);

	if(!data || msg.indexOf('{') === -1){
		// 短路测试，对于无需格式化的字符串直接返回
		return msg;
	}

	msg = new IntlMessageFormat(msg, chrome.i18n.getUILanguage());
	return msg.format(data);
};
