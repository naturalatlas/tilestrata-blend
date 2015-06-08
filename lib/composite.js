var async = require('async');
var mapnik = require('mapnik');

module.exports = function(buffers, options, callback) {
	var format = options.format || "png";
	var comp_options = {
		comp_op: mapnik.compositeOp[options["comp-op"]],
		opacity: options.opacity || 100,
		dx: 0,
		dy: 0
	};

	async.map(buffers, function(buffer, callback) {
		mapnik.Image.fromBytes(buffer, function(err, image) {
			if (err) return callback(err);
			image.premultiply(function(err){
				callback(err, image);
			});
		});
	}, function(err, images){
		if (err) return callback(err);

		var result = images.unshift();

		async.eachSeries(images, function(image, callback) {
			result.composite(image, comp_options, callback);
		}, function(err){
			if(err) return callback(err);
			result.demultiply(function(err){
				if(err) return callback(err);
				result.encode(format, callback);
			});
		});
	});
}
