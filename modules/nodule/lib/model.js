module.exports = (function () {
	function top(a) { if (!a) return null; if (a.length==0) return null; return a[a.length-1]; }
	function whereFromSelector(selector) {
		var rx = (/(\#[^\#\.\[\]]+)|(\.[^\#\.\[\]]+)|\[([^\]><=\^\$\*@]*)(=|<|>|\^=|\$=|\*=|@|>=|<=)"([^"]*)"|\[([^\]><=\^\$\*@]*)(=|<|>|\^=|\$=|\*=|@|>=|<=)'([^']*)'\]|\[([^\]><=\^\$\*@]*)(>=|<=|=|<|>|\^=|\$=|\*=|@)([^\]]*)/g),
			filters = [];
		selector.replace(rx, function (ret, id, name) {
			var attr, comp, value;
			if (id) return filters.push('(id='+client.escape(id.substr(1))+')');
			if (name) return filters.push('(name='+client.escape(name.substr(1))+')');
			for (i=3; i<=9; i+=3) if (!!arguments[i]) { attr=arguments[i]; comp=arguments[i+1]; value=arguments[i+2]; }
			if (attr && comp && value) {
				attr = '`'+client.escape(attr, false)+'`';
				value = client.escape(value, false);
				switch (comp) {
					case '@':return filters.push(attr+' like \''+value+'\'');
					case '*=':return filters.push(attr+' like \'%'+value+'%\'');
					case '^=':return filters.push(attr+' like \''+value+'%\'');
					case '$=':return filters.push(attr+' like \'%'+value+'\'');
					default:return filters.push(attr+comp+'\''+value+'\'');
				}
			}
		});
		return '(('+filters.join(') AND (')+'))';
	};
	function buildClauses(inst) {
		var ret = '',
		    lim = top(inst._limit), 
			ofs = top(inst._offset),
			ord = top(inst._order);
		if (inst.filters.length)
			ret = inst.filters.join('').replace(/^ *(AND|OR) */g, 'WHERE ');
		if (lim != -1 && lim !== null) {
			ret+= ' LIMIT '+lim;
			if (ofs != 0 && ofs !== null) ret+=' OFFSET '+ofs;
		}
		if (ord) ret+='ORDER BY '+ord[0]+(ord[1]?' ASC':' DESC');
		return ret;
	};
	
	var client = null;
	var Table = function (table) {
		if (!(this instanceof Table)) return new Table(table);
		this.tableName = table;
	};
	
	Table.prototype.tableName=null;
	Table.prototype.filters = [];
	Table.prototype._offset = [];
	Table.prototype._limit = [];
	Table.prototype._order = [];
	Table.prototype.toString = function () {
		return [Model (this.tableName)];
	};
	
	Table.prototype.push = function (filter, offset, limit, orderCol, order) {
		this.filters.push(filter || '');
		this._offset.push(offset || top(this._offset));
		this._limit.push(limit || top(this._limit));
		this._order.push(orderCol?[orderCol, !!order]:top(this._order));
	};
	Table.prototype.pop = function () {
		if (!this.filters.length) return;
		return {
			filter: this.filters.pop(),
			offset: this._offset.pop()+0,
			limit: this._limit.pop()+0,
			order: this._order.pop()
		};
	};
	
	
	Table.prototype.end = function () {
		this.pop();
		return this;
	};
	Table.prototype.find = function find(selector) {
		this.push(' OR '+whereFromSelector(selector));
		return this;
	};
	Table.prototype.filter = function filter(selector) {
		this.push(' AND '+whereFromSelector(selector));
		return this;
	};
	Table.prototype.eq = function eq(N) {
		this.push(null, N, 1);
		return this;
	};
	Table.prototype.offset = function offset(N) {
		this.push(null, N);
		return this;
	};
	Table.prototype.limit = function limit(N) {
		this.push(null, null, N);
		return this;
	};
	Table.prototype.get = function (dataCallback) {
		var query = 'SELECT * FROM '+this.tableName+' '+buildClauses(this);
		var inst = this;
		client.query(query, function (dum, data) {
			dataCallback.apply(inst, data);
		});
	};
	Table.prototype.query = function () {
		return client.query.apply(client.query, arguments);
	};
	Table.prototype.count = function () {
		
	};
	
	var Model = function (modelName) {
		try {
			var mdl = require(process.cwd()+'/Model/'+modelName+'.js');
			return mdl;
		} catch (e) {};
		return Model.load(modelName);
	};
	Model.load = function(table) {
		return new Table(table);
	};
	Model.query = function () {
		return client.query.apply(client.query, arguments);
	};
	Model.connect = function Connect (descriptor) {
		var url = require('url').parse(descriptor);
		url.auth = url.auth.split(':');
		while (url.auth.length<2) url.auth.push('');
		var connection = {
			user: url.auth[0],
			password: url.auth[1],
			host: url.hostname,
			port: url.port || 3306,
			database: url.pathname.replace(/^\//,'')
		};
		client = new (require(url.protocol.replace(/\:$/,'')).Client)(connection);
		client.connect();
		Model.client = client;
		return Model;
	};
	
	return Model.connect;
	
})();
