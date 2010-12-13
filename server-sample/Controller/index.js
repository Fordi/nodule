module.exports = (function (Model) {
	var Template = require('nodule/lib/template');
	return {
		index: function (Request, Response, paramOptions) {
			var Posts = Model('post');
			Response.writeHead(404, {'Content-Type': 'text/html'});
			Response.end('Nothing doing');
			return true;
		},
		fail: function (Request, Response, paramOptions) {
			this=5;
		}
	};
});