var assert = require('chai').assert;
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');

function createParent() {
	removeParent();
	var parentdir = path.resolve(__dirname, '../..');
	fs.ensureDirSync(parentdir + '/node_modules/mapnik');
	fs.writeFileSync(parentdir + '/node_modules/mapnik/index.js', '');
	fs.writeFileSync(parentdir + '/node_modules/mapnik/package.json', JSON.stringify({
		"name": "mapnik",
		"version": "0.0.0",
		"dependencies": {},
		"main": "index.js"
	}));

}
function removeParent() {
	var parentdir = path.resolve(__dirname, '../..');
	fs.removeSync(parentdir + '/node_modules/mapnik');
}

describe('On NPM install', function() {
	after(function(done) {
		this.timeout(1000*60*10);
		removeParent();
		fs.removeSync(__dirname+'/../node_modules/blend');
		child_process.exec('npm install', function(err, stdout, stderr) {
			if (err) throw err;
			done();
		});
	});
	// more than one in the same process causes problems
	it('it should not remove own mapnik dependency if one does not exist higher in the tree', function(done) {
		this.timeout(1000*60*10);
		removeParent();
		child_process.exec('npm install', function(err, stdout, stderr) {
			if (err) throw err;
			assert.isTrue(fs.existsSync(__dirname + '/../node_modules/blend/node_modules/mapnik/package.json'));
			done();
		});
	});
	it('it should remove own mapnik dependency if one exists higher in the tree', function(done) {
		this.timeout(1000*60*10);
		removeParent();
		child_process.exec('npm install', function(err, stdout, stderr) {
			if (err) throw err;
			createParent();
			assert.isTrue(fs.existsSync(__dirname + '/../node_modules/blend/node_modules/mapnik/package.json'));
			child_process.exec('npm install', function(err) {
				if (err) throw err;
				assert.isFalse(fs.existsSync(__dirname + '/../node_modules/blend/node_modules/mapnik/package.json'));
				done();
			});
		});
	});
});
