module.exports = (function (Model) {
	var Template = require('nodule/template');
	return {
		index: function (Request, Response, paramOptions) {
			var Posts = Model('post');
			return true;
		}
	};
});