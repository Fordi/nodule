module.exports = (function () {
	var fs = require('fs');
	return function (Request, Response, Next) {
		var fn = process.cwd()+'/Static'+Request.url;
		fs.readFile(fn, function (err, data) {
			if (err) {
				Next(err);
				return;
			}
			Response.writeHead(200, {'Content-Type': 'text/html'});
			Response.end(data);
		});
	};
	
})();