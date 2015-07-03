var Vue = require('vue');

var App = module.exports = new Vue({
	replace: false,
	template: `<style>${require('../style.less')}</style>` +
	require('raw!../html/float.html'),
	data: {
		expanded: false,
		pages: [],
	},
	methods: {
		toggle() {
			this.expanded = !this.expanded;
		},
		changeAll(event){
			var checked = event.target.checked;
			this.pages.forEach(function updateCheck(page) {
				page.checked = checked;
			});
		},
		download(){
			if (this.checkedCount === 0) {
				return;
			}

			EventBus.emit('download', this.pages.map(R.prop('checked')));

			if (this.isMulti) {
				this.changeAll({
					target: {
						checked: false,
					},
				});
			}
		},
	},
	computed: {
		messages(){
			var msg = [];

			if (this.pages.length === 0) {
				msg.push(['blue', __('download_unavail_or_loading')]);
			}

			return msg;
		},
		checkedCount(){
			var count = 0;
			this.pages.forEach(function countPage(page) {
				if (page.checked) {
					count++;
				}
			});
			return count;
		},
		isMulti(){
			return this.pages.length > 1;
		},
	},
});


(function attachShadow() {
	var hostElement = document.createElement('div');
	var shadow = hostElement.createShadowRoot();

	App.$mount(shadow);
	document.body.appendChild(hostElement);
}());

require('../../sites/runner.js').pageObservable.subscribe(function pushToPopup(pages) {
	pages = pages.map(function setDefaultChecked(page) {
		page.checked = true;
		return page;
	});

	App.pages = pages;
});
