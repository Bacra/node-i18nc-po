var _             = require('lodash');
var expect        = require('expect.js');
var creator       = require('../lib/create');
var i18ncCode     = require('i18nc-core');
var autoTestUtils = require('./auto_test_utils')


describe('#create', function()
{
	describe('#utils', function()
	{
		it('#getCodeUsedLans', function()
		{
			var json =
			{
				words:
				{
					funcTranslateWords:
					{
						"file_key1": [{"zh-TW": {DEFAULTS: {}}}],
						"file_key2": [{"zh-HK": {DEFAULTS: {}}}],
						"file_key3": [{"zh-HK": {DEFAULTS: {}}}],
					},
					usedTranslateWords: {"en-US": {}},
				},
				subScopeDatas: [
				{
					words:
					{
						funcTranslateWords:
						{
							"file_key3": [{"zh-HK": {DEFAULTS: {}}}],
						},
						usedTranslateWords: {"en-MD": {}},
					}
				}]
			};

			expect(creator._getCodeUsedLans(json).sort())
				.to.eql(['zh-TW', 'zh-HK', 'en-US', 'en-MD'].sort());
		});
	});

	describe('#build', function()
	{
		function getInputData()
		{
			var inputData = i18ncCode(require('./files/input.js').toString());
			var usedTranslateWords =
			{
				"en-US": {
					"DEFAULTS": {
						"简体": "cn"
					},
					"SUBTYPES": {
						"subtype": {
							"简体": "zh"
						}
					}
				},
				"zh-TW": {
					"DEFAULTS": {
						"简体": "簡體"
					}
				}
			};

			function adornInputData(json)
			{
				delete json.code;
				if (json.words) json.words.usedTranslateWords = usedTranslateWords;
				if (json.subScopeDatas) json.subScopeDatas.forEach(adornInputData);
			}

			adornInputData(inputData);

			return inputData;
		}


		it('#base', function()
		{
			var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/base');
			var output = creator.create(getInputData(),
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
			var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/no_pickFileLanguages');
			var output = creator.create(getInputData(),
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
			function handler(type)
			{
				it('#'+type, function()
				{
					var requireAfterWrite = autoTestUtils.requireAfterWrite('output_create/existedTranslateFilter/'+type);
					var output = creator.create(getInputData(),
						{
							existedTranslateFilter: type
						});

					var otherPot = requireAfterWrite('lans.pot', output.pot, {readMode: 'string'});
					expect(autoTestUtils.code2arr(output.pot)).to.eql(autoTestUtils.code2arr(otherPot));

					_.each(output.po, function(content, filename)
					{
						var otherPo = requireAfterWrite(filename+'.po', content, {readMode: 'string'});
						expect(autoTestUtils.code2arr(content)).to.eql(autoTestUtils.code2arr(otherPo));
					});
				});
			}

			handler('empty');
			handler('keep');
		});

	});

});
