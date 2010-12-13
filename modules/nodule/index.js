module.exports = (function () {
	var conf = require(process.cwd()+'/config.js');
	var ModelBase = require('nodule/model')(conf.datasource);
	
	var Url = require('url'),
		FS = require('fs'),
		StaticFile = require('./static'),
		splitPath = function (str) {
			var i, ret = [], set = str.split('/');
			for (i=0; i<set.length; i++) 
				if (set[i] != '') 
					ret.push(set[i]);
			return ret;
		},
		dispatcher = null,
		httpServer = function (req, res) {
			var url = Url.parse(req.url, true),
				command = splitPath(url.pathname);
			while (command.length<2) command.push('index');
			try {
				var ctl = require(process.cwd()+'/Controller/'+command[0]+'.js')(ModelBase);
				if (ctl[command[1]]) {
					if (ctl[command[1]].call(dispatcher, req, res, url.query)) return;
				}
			} catch (e) {};
			StaticFile(req, res, function () {
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.end(require('nodule/template')('Error/General', {
					errorCode: '404',
					errorMessage: 'File Not Found'
				}));
			});
		};
	dispatcher = require('http').createServer(httpServer);
	return dispatcher;
})();