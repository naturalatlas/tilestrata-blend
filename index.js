var _ = require('lodash');
var async = require('async');
var mapnik = require('mapnik');
var dependency = require('tilestrata-dependency');

module.exports = function(layers, options) {
	options = options || {};

	var layers = layers.map(function(pair) {
		var layer = pair[0];
		var filename = pair[1];
		var comp_options = pair[2] || {};
		comp_options.comp_op = mapnik.compositeOp[comp_options.comp_op || 'src_over'];

		_.defaults(comp_options, {
			dx: 0, dy: 0, opacity: 1
		});

		return [dependency(layer, filename), comp_options];
	});

	return {
		serve: function(server, req, callback) {
			var tiles, result, images, matte;
			var canvasSize;

			var generateMatte = async.memoize(function(callback) {
				if (!canvasSize || options.matte === null || typeof options.matte === 'undefined') {
					return callback();
				}
				var matte = new mapnik.Image(canvasSize, canvasSize);
				matte.fill(new mapnik.Color('#'+options.matte), function(err) {
					if (err) return callback(err);
					matte.premultiply(function(err) {
						callback(err, matte);
					});
				});
			});

			async.map(layers, function(layer, callback) {
				var image, buffer, options = layer[1];

				async.series([
					function fetchTile(callback) {
						var provider = layer[0];
						provider.serve(server, req, function(err, _buffer, headers) {
							if (err && err.statusCode === 404) return callback();
							buffer = _buffer;
							callback(err);
						});
					},
					function prepareImage(callback) {
						if (!buffer) return callback();
						mapnik.Image.fromBytes(buffer, function(err, _image) {
							if (err) return callback(err);

							// pre-emptively generate matte now that we know the bounds
							if (!canvasSize) {
								canvasSize = _image.width();
								generateMatte(function() {});
							}

							_image.premultiply(function(err) {
								image = _image;
								callback(err);
							});
						});
					}
				], function(err) {
					callback(err, image ? [image, options] : null);
				});
			}, function(err, images) {
				if (err) return callback(err);
				generateMatte(function(err, matte) {
					if (err) return callback(err);
					var intermediate = matte;
					async.eachSeries(images, function(res, callback) {
						if (!res) return callback();
						var image = res[0];
						if (!intermediate) {
							intermediate = image;
							return callback();
						}
						intermediate.composite(image, res[1], callback);
					}, function(err) {
						if (err) return callback(err);
						intermediate.demultiply(function(err) {
							if (err) return callback(err);
							intermediate.encode('png', function(err, buffer) {
								if (err) return callback(err);
								intermediate = null;
								callback(null, buffer, {'Content-Type': 'image/png'});
							});
						});
					});
				});
			});
		}
	};
};
