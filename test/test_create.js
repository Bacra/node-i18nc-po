var _             = require('lodash');
var expect        = require('expect.js');
var inputData     = require('./input.json');
var i18ncPO       = require('../');
var autoTestUtils = require('./auto_test_utils');


describe('#create', function()
{
	it('#base', function()
	{
		var output = i18ncPO.create(inputData,
			{
				title: '第一份翻译稿v1.0',
				email: 'bacra.woo@gmail.com',
				pickFileLanguages: ['en-US']
			});

		var otherPot = autoTestUtils.requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
		expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

		_.each(output.po, function(content, filename)
		{
			var otherPo = autoTestUtils.requireAfterWrite(filename+'.po', content, {readMode: 'string'});
			expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
		});
	});
});
