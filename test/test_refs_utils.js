var expect    = require('expect.js')
var refsUtils = require('../lib/refs_utils');

describe('#refs_utils', function()
{
	describe('#generate', function()
	{
		it('#no subtype', function()
		{
			expect(refsUtils.generate('fileKey')).to.be('0,fileKey');
			expect(refsUtils.generate()).to.be('0');
		});

		it('#with subtype', function()
		{
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1']))
				.to.be('1,0,7,subtype,fileKey');
			expect(refsUtils.generate('', 'subtype', ['msg1']))
				.to.be('1,0,7,subtype');
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1', 'msg2']))
				.to.be('1,1,0,7,subtype,fileKey');
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1', 'msg2%sMsg3']))
				.to.be('1,1,0,7,subtype,fileKey');
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1%sMsg2', 'msg3']))
				.to.be('1,1,1,7,subtype,fileKey');
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1%sMsg2', 'msg3%sMsg4']))
				.to.be('1,1,1,7,subtype,fileKey');
			expect(refsUtils.generate('fileKey', 'subtype', ['msg1%sMsg2', 'msg3%sMsg4', 'msg5']))
				.to.be('1,2,1,3,7,subtype,fileKey');
		});

		it('#error', function()
		{
			expect(function(){refsUtils.generate(null, 'subtype')}).to.throwError('ERROR_INPUT');
			expect(function(){refsUtils.generate(null, 'subtype', [])}).to.throwError('ERROR_INPUT');
		});
	});

	describe('#parse', function()
	{
		it('#type0', function()
		{
			expect(refsUtils.parse('0', 'msg1%sMsg2')).to.eql(
				{
					fileKey : '',
					subtype : undefined,
					msgs    : ['msg1%sMsg2']
				});

			expect(refsUtils.parse('0,fileKey', 'msg1%sMsg2')).to.eql(
				{
					fileKey : 'fileKey',
					subtype : undefined,
					msgs    : ['msg1%sMsg2']
				});

			expect(refsUtils.parse('0,fileKey1,fileKey2', 'msg1%sMsg2')).to.eql(
				{
					fileKey : 'fileKey1,fileKey2',
					subtype : undefined,
					msgs    : ['msg1%sMsg2']
				});
		});

		describe('#type1', function()
		{
			it('#base', function()
			{
				expect(refsUtils.parse('1,0,7,subtype,fileKey', 'msg1%sMsg2')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						msgs: ['msg1%sMsg2']
					});
			});

			it('#split msg', function()
			{
				expect(refsUtils.parse('1,1,0,7,subtype,fileKey', 'msg1%sMsg2')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						msgs: ['msg1', 'Msg2']
					});

				expect(refsUtils.parse('1,2,0,1,7,subtype,fileKey', 'msg1%sMsg2%sMsg3')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						msgs: ['msg1', 'Msg2', 'Msg3']
					});

				expect(refsUtils.parse('1,1,1,7,subtype,fileKey', 'msg1%sMsg2%sMsg3')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						msgs: ['msg1%sMsg2', 'Msg3']
					});
			});
		});

		describe('#error', function()
		{
			console.log('@todo');
		});
	});

});
