var _             = require('lodash');
var expect        = require('expect.js');
var creator       = require('../lib/create');
var autoTestUtils = require('./auto_test_utils')


describe('#create', function()
{
	it('#getCodeUsedLans', function()
	{
		var json =
		{
			funcTranslateWords:
			{
				"file_key1": {"zh-TW": {DEFAULTS: {}}},
				"file_key2": {"zh-HK": {DEFAULTS: {}}},
				"file_key3": {"zh-HK": {DEFAULTS: {}}},
			},
			usedTranslateWords: {"en-US": {}},
			subScopeDatas: [
			{
				funcTranslateWords:
				{
					"file_key3": {"zh-HK": {DEFAULTS: {}}},
				},
				usedTranslateWords: {"en-MD": {}},
			}]
		};

		expect(creator._getCodeUsedLans(json).sort())
			.to.eql(['zh-TW', 'zh-HK', 'en-US', 'en-MD'].sort());
	});


	it('#base', function()
	{
		var inputData = require('./files/input.json');
		var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/base');
		var output = creator.create(inputData,
			{
				title: '第一份翻译稿v1.0',
				email: 'bacra.woo@gmail.com',
				pickFileLanguages: ['en-US', 'zh-HK']
			});

		var otherPot = requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
		expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

		_.each(output.po, function(content, filename)
		{
			var otherPo = requireAfterWrite(filename+'.po', content, {readMode: 'string'});
			expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
		});
	});

	it('#no pickFileLanguages', function()
	{
		var inputData = require('./files/input.json');
		var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/no_pickFileLanguages');
		var output = creator.create(inputData,
			{
				title: '第一份翻译稿v1.0',
				email: 'bacra.woo@gmail.com'
			});

		var otherPot = requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
		expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

		_.each(output.po, function(content, filename)
		{
			var otherPo = requireAfterWrite(filename+'.po', content, {readMode: 'string'});
			expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
		});
	});

	describe('#existedTranslateFilter', function()
	{
		it('#empty', function()
		{
			var inputData = require('./files/input.json');
			var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/existedTranslateFilter/empty');
			var output = creator.create(inputData,
				{
					existedTranslateFilter: 'empty'
				});

			var otherPot = requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
			expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

			_.each(output.po, function(content, filename)
			{
				var otherPo = requireAfterWrite(filename+'.po', content, {readMode: 'string'});
				expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
			});
		});

		it('#keep', function()
		{
			var inputData = require('./files/input.json');
			var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/existedTranslateFilter/keep');
			var output = creator.create(inputData,
				{
					existedTranslateFilter: 'keep'
				});

			var otherPot = requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
			expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

			_.each(output.po, function(content, filename)
			{
				var otherPo = requireAfterWrite(filename+'.po', content, {readMode: 'string'});
				expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
			});
		});
	});

});
