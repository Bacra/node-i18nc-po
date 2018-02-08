I18NC-PO
==================


[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]
[![NPM License][license-image]][npm-url]

# Install
```
npm install i18nc-po --save
```

# Useage

```
var fs = require('fs');
var i18nc = require('i18nc-core');
var i18ncPO = require('i18nc-po');
var ret = i18nc(code, options);

i18ncPO.create(ret);    // return content of pot and po

var poContent = fs.readFileSync('en-US.po').toString();
i18ncPO.parse(poContent);      // return dbTranslateWords for i18nc-core
```



[npm-image]: http://img.shields.io/npm/v/i18nc-po.svg
[downloads-image]: http://img.shields.io/npm/dm/i18nc-po.svg
[npm-url]: https://www.npmjs.org/package/i18nc-po
[travis-image]: http://img.shields.io/travis/Bacra/node-i18nc-po/master.svg?label=linux
[travis-url]: https://travis-ci.org/Bacra/node-i18nc-po
[coveralls-image]: https://img.shields.io/coveralls/Bacra/node-i18nc-po.svg
[coveralls-url]: https://coveralls.io/github/Bacra/node-i18nc-po
[license-image]: http://img.shields.io/npm/l/i18nc-po.svg
