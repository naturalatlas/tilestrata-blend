# tilestrata-blend
[![NPM version](http://img.shields.io/npm/v/tilestrata-blend.svg?style=flat)](https://www.npmjs.org/package/tilestrata-blend)
[![Build Status](https://travis-ci.org/naturalatlas/tilestrata-blend.svg)](https://travis-ci.org/naturalatlas/tilestrata-blend)
[![Coverage Status](http://img.shields.io/coveralls/naturalatlas/tilestrata-blend/master.svg?style=flat)](https://coveralls.io/r/naturalatlas/tilestrata-blend)

A [TileStrata](https://github.com/naturalatlas/tilestrata) plugin for blending multiple tiles into a single PNG image. It supports variable opacity and blending modes, and image filters. To use this plugin, you must have [mapnik](https://www.npmjs.com/package/mapnik) in your dependency tree.

```sh
$ npm install tilestrata-blend --save
```

### Sample Usage

```js
var blend = require('tilestrata-blend');

// simple
server.layer('mylayer').route('combined.png')
    .use(blend([
        ['satellite','t.png'],
        ['basemap','roads.png'],
        ['basemap','poi.png']
    ], {
        matte: 'ffffff'
    }));

// with blending modes
server.layer('mylayer').route('combined.png')
    .use(blend([
        ['satellite','t.png'],
        ['basemap','roads.png'],
        ['basemap','hillshade.png',{
            opacity: 0.5,
            comp_op: 'multiply',
            image_filters: 'agg-stack-blur(10,10)'
        }],
        ['basemap','poi.png']
    ], {
        matte: 'ffffff'
    }));
```

## Contributing

Before submitting pull requests, please update the [tests](test) and make sure they all pass.

```sh
$ npm test
```

## License

Copyright &copy; 2015-2016 [Natural Atlas, Inc.](https://github.com/naturalatlas) & [Contributors](https://github.com/naturalatlas/tilestrata-blend/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
