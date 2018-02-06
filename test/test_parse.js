var fs            = require('fs');
var expect        = require('expect.js');
var i18ncPO       = require('../');
var autoTestUtils = require('./auto_test_utils');

describe('#parse', function()
{
	it('#base', function()
	{
		var json = i18ncPO.parse(fs.readFileSync(__dirname+'/input.po').toString());
		var otherJson = autoTestUtils.requireAfterWrite('translate_data.json', JSON.stringify(json, null, '\t'));
		expect(json).to.eql(otherJson);
	});
});
