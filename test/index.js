var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var assertImage = require('./utils/assertImage.js');
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
			]);

			var req = TileRequest.parse('/srcc/3/2/1/c.png', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'GET');
			provider.serve(server, req, function(err, buffer, headers) {
				if (err) throw err;
				assert.deepEqual(headers, {'Content-Type':'image/png'});
				assert.instanceOf(buffer, Buffer);
				assertImage(buffer, __dirname+'/fixtures/b_out.png');
				done();
			});
		}),
		it('should send 204 No Data if no sources', function(done) {
			var server = new TileServer();
			server
				.layer('srcb').route('b.png').use({
					serve: function(server, req, callback) {
						callback(null, fs.readFileSync(__dirname+'/fixtures/b.png'), {});
					}
				});

			var provider = blend([]);
			var req = TileRequest.parse('/srcc/3/2/1/c.png', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'GET');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.instanceOf(err, Error);
				assert.equal(err.statusCode, 204, 'err.statusCode');
				assert.equal(err.message, 'No sources available to blend', 'err.message');
				done();
			});
		});
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
				['srcb','b.png',{
					opacity: 0.8,
					image_filters: 'agg-stack-blur(5,5)',
					comp_op: 'overlay'
				}]
			], {
				matte: '4d4c49'
			});

			var req = TileRequest.parse('/srcc/3/2/1/c.png', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'GET');
			provider.serve(server, req, function(err, buffer, headers) {
				if (err) throw err;
				assert.deepEqual(headers, {'Content-Type':'image/png'});
				assert.instanceOf(buffer, Buffer);
				assertImage(buffer, __dirname+'/fixtures/c.png');
				done();
			});
		});
	});
});
