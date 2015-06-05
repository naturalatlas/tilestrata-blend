var async = require('async');
var blend = require('mapnik').blend;
var dependency = require('tilestrata-dependency');

module.exports = function(layers, options) {
	options = options || {};

	var layers = layers.map(function(pair) {
		var layer = pair[0];
		var filename = pair[1];
		return dependency(layer, filename);
	});

	return {
		serve: function(server, req, callback) {
			var buffers, result;

			async.series([
				function loadTiles(callback) {
					async.map(layers, function(layer, callback) {
						layer.serve(server, req, function(err, buffer, headers) {
							if (err && err.statusCode === 404) return callback();
							callback(err, buffer);
						});
					}, function(err, result) {
						buffers = result.filter(function(buffer) { return !!buffer; });
						callback(err);
					});
				},
				function blendTiles(callback) {
					blend(buffers, options, function(err, blended) {
						buffers = null;
						result = blended;
						callback(err);
					});
				}
			], function(err) {
				if (err) return callback(err);
				callback(null, result, {'Content-Type': 'image/'+(options.format||'png')});
			});
		}
	};
};
