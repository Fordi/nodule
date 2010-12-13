module.exports = (function () {
	var serverRoot = process.cwd(),
		conf = require(serverRoot+'/config.js'),
		ModelBase = require('./model')(conf.datasource),
		Url = require('url'),
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
				var ctl = require(serverRoot+'/Controller/'+command.shift()+'.js')(ModelBase),
					action = command.shift();
				var args = command.unshift(req, res, url.query);
				if (ctl[action] && ctl[action].apply(dispatcher, args)) return;
			} catch (e) {};
			StaticFile(req, res, function () {
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.end(require('./template')('Error/General', {
					errorCode: '404',
					errorMessage: 'File Not Found',
					url: req.url
				}));
			});
		};
	dispatcher = require('http').createServer(httpServer);
	return dispatcher;
})();