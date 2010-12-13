module.exports = function (Model) {
	var baseModel = Model.load('post');
	baseModel.query([
		'CREATE TABLE IF NOT EXISTS post (',
			'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ',
			'published TIMESTAMP DEFAULT NOW(), ',
			'title TEXT NOT NULL, ',
			'post LONGTEXT NOT NULL',
		')'
	].join(''));
	
	return baseModel;
};