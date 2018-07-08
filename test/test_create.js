'use strict';

var _             = require('lodash');
var expect        = require('expect.js');
var creator       = require('../lib/create');
var i18nc         = require('i18nc-core');
var autoTestUtils = require('./auto_test_utils')


describe('#create', function()
{
	it('#base', function()
	{
		var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/base');
		var output = creator.create(i18nc('alert("中文词典")', {isCheckClosureForNewI18NHandler: false}),
			{
				title: '第一份翻译稿v1.0',
				email: 'bacra.woo@gmail.com',
				pickFileLanguages: ['en-US', 'zh-HK']
			});

		var otherPot = requireAfterWrite('lans.pot', output.pot, {mode: 'string'});
		expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

		_.each(output.po, function(content, filename)
		{
			var otherPo = requireAfterWrite(filename+'.po', content, {mode: 'string'});
			expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
		});
	});

	it('#no pickFileLanguages', function()
	{
		var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/no_pickFileLanguages');
		var output = creator.create(getInputData(),
			{
				title: '第一份翻译稿v1.0',
				email: 'bacra.woo@gmail.com'
			});

		var otherPot = requireAfterWrite('lans.pot', output.pot, {mode: 'string'});
		expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

		_.each(output.po, function(content, filename)
		{
			var otherPo = requireAfterWrite(filename+'.po', content, {mode: 'string'});
			expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
		});
	});

	describe('#existedTranslateFilter', function()
	{
		function handler(type)
		{
			it('#'+type, function()
			{
				var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/existedTranslateFilter/'+type);
				var output = creator.create(getInputData(),
					{
						existedTranslateFilter: type
					});

				var otherPot = requireAfterWrite('lans.pot', output.pot, {mode: 'string'});
				expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

				_.each(output.po, function(content, filename)
				{
					var otherPo = requireAfterWrite(filename+'.po', content, {mode: 'string'});
					expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
				});
			});
		}

		handler('empty');
		handler('keep');
		handler('ignore');
	});

});


function getInputData()
{
	var inputData = i18nc(require('./files/input.js').toString(),
		{
			dbTranslateWords: {
				"en-US": {
					"*": {
						"DEFAULTS": {
							"简体": "cn",
							"中文": "zh"
						},
						"SUBTYPES": {
							"subtype": {
								"简体": "zh"
							}
						}
					}
				},
				"zh-TW": {
					"*": {
						"DEFAULTS": {
							"简体": "簡體"
						}
					}
				}
			}
		});

	return inputData;
}
