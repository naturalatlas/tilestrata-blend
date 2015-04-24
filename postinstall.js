var fs = require('fs-extra');

try { require.resolve('mapnik'); }
catch (e) { process.exit(0); }
fs.removeSync(__dirname + '/node_modules/blend/node_modules/mapnik');
