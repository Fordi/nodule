module.exports = (function () {
	var httpError = function (Response, errorCode, errorMessage, errorTemplate, obj) {
			Response.writeHead(errorCode, {'Content-Type': 'text/html'});
			console.error('HTTP '+errorCode+': '+errorMessage);
			console.error(obj);
			obj.errorCode = errorCode;
			obj.errorMessage = errorMessage;			
			Response.end(require('./template')('Error/'+errorTemplate, obj));
		},
		serverRoot = process.cwd(),
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
			console.log('---Request: '+req.url);
			var url = Url.parse(req.url, true),
				command = splitPath(url.pathname);
			while (command.length<2) command.push('index');
			var controllerName=command.shift(),
				action=command.shift(),
				ctl=null;
			command.unshift(req, res, url.query);
			try {
				ctl = require(serverRoot+'/Controller/'+controllerName+'.js');
			} catch(e) {};
			if (ctl) {
				try {
					ctl=ctl(ModelBase);
				} catch (e) {
					console.error('Could not attach model base class to controller');
					console.error('Failed with message:');
					console.error(e.message);
				}
				if (ctl[action]) {
					console.log(
						'Serving request to controller: '+
						controllerName+'::'+action
					);
					try {
						ctl[action].apply(dispatcher, command);
					} catch (e) {
						console.error('Execution of '+controllerName+'::'+action+' failed');
						httpError(res, 500, 'Programmers are bad at their job', 'General', {
							url: req.url
						});
					}
					return;
				}
			}
			console.log('Trying to serve '+req.url);
			StaticFile(req, res, function () {
				console.log('File not Found: '+serverRoot+'/Static'+req.url);
				httpError(res, 404, 'File Not Found', 'General', {
					url: req.url
				});
			});
		};
	dispatcher = require('http').createServer(httpServer);
	return dispatcher;
})();