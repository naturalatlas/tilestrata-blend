var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var blend = require('../index.js');
var assert = require('chai').assert;
var fs = require('fs');

describe('Provider Implementation "blend"', function() {
	describe('serve()', function() {
		it('should silently omit sources that return 404', function(done) {
			var server = new TileServer();
			server
				.layer('srcb').route('b.png').use({
					serve: function(server, req, callback) {
						callback(null, fs.readFileSync(__dirname+'/fixtures/b.png'), {});
					}
				});

			var provider = blend([
				['srca','a.png'],
				['srcb','b.png']
			], {
				format: 'jpeg',
				quality: 100,
				matte: '4d4c49'
			});

			var req = TileRequest.parse('/srcc/3/2/1/c.png', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'GET');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.isFalse(!!err, err);
				assert.deepEqual(headers, {'Content-Type':'image/jpeg'});
				assert.instanceOf(buffer, Buffer);
				assert.deepEqual(buffer, fs.readFileSync(__dirname+'/fixtures/b_out.jpg'));
				done();
			});
		}),
		it('should blend sources', function(done) {
			var server = new TileServer();
			server
				.layer('srca').route('a.png').use({
					serve: function(server, req, callback) {
						callback(null, fs.readFileSync(__dirname+'/fixtures/a.png'), {});
					}
				})
				.layer('srcb').route('b.png').use({
					serve: function(server, req, callback) {
						callback(null, fs.readFileSync(__dirname+'/fixtures/b.png'), {});
					}
				});

			var provider = blend([
				['srca','a.png'],
				['srcb','b.png']
			], {
				format: 'jpeg',
				quality: 100,
				matte: '4d4c49'
			});

			var req = TileRequest.parse('/srcc/3/2/1/c.png', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'GET');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.isFalse(!!err, err);
				assert.deepEqual(headers, {'Content-Type':'image/jpeg'});
				assert.instanceOf(buffer, Buffer);
				assert.deepEqual(buffer, fs.readFileSync(__dirname+'/fixtures/c.jpg'));
				done();
			});
		});
	});
});
