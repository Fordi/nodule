module.exports = (function(){
	var Path = require('path'),
		FS = require('fs'),
		tplBuffer = function tplBuffer (obj) {
			function stackEntry(obj, file) {
				this.info = {obj: obj, file: file};
				this.tplBuffer = [];
			};
			stackEntry.prototype.tplBuffer = [];
			stackEntry.prototype.echo = function () {
				this.tplBuffer.push.apply(this.tplBuffer, arguments);
			};
			stackEntry.prototype.toString = function () {
				return this.tplBuffer.join('');
			};
			var stack=[ new stackEntry(obj, '') ];
			stack.top=function(){ 
				return this[this.length-1]; 
			};
			return {
				echo: function(){
					stack.top().echo.apply(stack.top(), arguments);
				}, 
				toString: function () {
					return stack.top().toString();
				},
				t: function (file, obj, close) {
					if (!file) {
						var last = stack.pop();
						last.info.obj.content = last.toString();
						return Template(last.info.file, last.info.obj);
					}
					if (!obj) obj = {};
					stack.push( new stackEntry(obj, file) );
					if (close) return arguments.callee();
					return '';
				}
			};
		},
		cache={},
		templateMethod = function (obj) {
			var tplBuffer = arguments.callee.tplBuffer(obj);
			if (!obj.content) obj.content = '';
			with (obj) { with (tplBuffer) { echo('%templateContent%'); }}
			return tplBuffer.toString();
		},
		templateTemplate = templateMethod
			.toString()
			.replace(/^[^f]*function *\([^\)]*\) *\{|\}[\s\r\t\n]*$/g,'');
	Template = function Template(file, data){
		var fn;
		file = process.cwd()+'/View/'+file+'.tpl';
		if (cache[file]) {
			fn = cache[file];
		} else {
			Path.exists(file, function (exists) {
				if (!exists) 	
					throw new Error('Template file '+file+' does not exist');
			});
			var tpl = templateTemplate.replace('%templateContent%',
				FS
					.readFileSync(file, 'utf8')
					.replace(/\r/g, '\\r')
					.replace(/\t/g, '\\t')
					.replace(/\n/g, '\\n')
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "');echo($1);echo('")
					.split("\t").join("');")
					.split("%>").join("; echo('")
					.split("\r").join("\\'")
			);
			fn = new Function("obj", tpl);
			fn.tplBuffer = tplBuffer;
		}
		
		return data ? fn( data ) : fn ( {} );
	};
	return Template;
})();

	