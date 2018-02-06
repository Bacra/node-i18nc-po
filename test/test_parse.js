var fs      = require('fs');
var i18ncPO = require('../');

var json = i18ncPO.parse(fs.readFileSync(__dirname+'/input.po').toString());

fs.writeFileSync(__dirname+'/output/translate_data.json', JSON.stringify(json, null, '\t'));
