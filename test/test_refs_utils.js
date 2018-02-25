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
			expect(refsUtils.parse('0')).to.eql(
				{
					fileKey : '',
				});

			expect(refsUtils.parse('0,fileKey')).to.eql(
				{
					fileKey : 'fileKey',
				});

			expect(refsUtils.parse('0,fileKey1,fileKey2')).to.eql(
				{
					fileKey : 'fileKey1,fileKey2',
				});
		});

		describe('#type1', function()
		{
			it('#base', function()
			{
				expect(refsUtils.parse('1,0,7,subtype,fileKey')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						joinIndexs: [],
					});
			});

			it('#joinIndexs', function()
			{
				expect(refsUtils.parse('1,1,0,7,subtype,fileKey')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						joinIndexs: [0]
					});

				expect(refsUtils.parse('1,2,0,1,7,subtype,fileKey')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						joinIndexs: [0, 1]
					});

				expect(refsUtils.parse('1,1,1,7,subtype,fileKey')).to.eql(
					{
						fileKey: 'fileKey',
						subtype: 'subtype',
						joinIndexs: [1]
					});
			});
		});

		describe('#error', function()
		{
			function expHanlder(str, errmsg)
			{
				expect(function(){refsUtils.parse(str)}).to.throwError(errmsg);
			}

			it('#type', function()
			{
				expHanlder('2', /Ref String Type Is Not Support/);
			});

			it('#joinIndex', function()
			{
				expHanlder('1,a,1', /JoinIndexs Length Is Wrong/);
				expHanlder('1,-1,1', /JoinIndexs Length Is Wrong/);
				expHanlder('1,1,a', /JoinIndex Is Wrong/);
				expHanlder('1,1,-1', /JoinIndex Is Wrong/);
			});

			it('#subtype', function()
			{
				expHanlder('1,0,a,subtype', /Subtype Length Is Wrong/);
				expHanlder('1,0,-1,subtype', /Subtype Length Is Wrong/);
				expHanlder('1,0,6,subtype', /FileKey Separator Is Wrong/);
				expHanlder('1,0,8,subtype', /Subtype String Length Is Wrong/);
			});

			it('#fileKey', function()
			{
				expHanlder('1,0,1,a;', /FileKey Separator Is Wrong/);
				expHanlder('1,0,1,a;a', /FileKey Separator Is Wrong/);
			});
		});
	});



	describe('#splitMsgByJoinIndexs', function()
	{
		it('#base', function()
		{
			expect(refsUtils._splitMsgByJoinIndexs('msg1%sMsg2', [0]))
				.to.eql(['msg1', 'Msg2']);
			expect(refsUtils._splitMsgByJoinIndexs('msg1%sMsg2%sMsg3', [0]))
				.to.eql(['msg1', 'Msg2%sMsg3']);
			expect(refsUtils._splitMsgByJoinIndexs('msg1%sMsg2%sMsg3', [1]))
				.to.eql(['msg1%sMsg2', 'Msg3']);
			expect(refsUtils._splitMsgByJoinIndexs('msg1%sMsg2%sMsg3', [0,1]))
				.to.eql(['msg1', 'Msg2', 'Msg3']);
			expect(refsUtils._splitMsgByJoinIndexs('msg1%sMsg2%sMsg3', [0,1,2]))
				.to.eql(['msg1', 'Msg2', 'Msg3']);
		});
	});


	describe('#mixMsgsByJoinIndexs', function()
	{
		it('#base', function()
		{
			expect(refsUtils.mixMsgsByJoinIndexs('msg1%sMsg2', '消息1%s消息2', [0]))
				.to.eql({'msg1': '消息1', 'Msg2': '消息2'});

		});

		it('#error', function()
		{
			expect(function()
				{
					refsUtils.mixMsgsByJoinIndexs('msg1', '消息1%s消息2', [0]);
				})
				.to.throwError('Miss Message Separator');

			expect(function()
				{
					refsUtils.mixMsgsByJoinIndexs('msg1%smsg2%smsg3', '消息1%s消息2', [0]);
				})
				.to.throwError('Miss Message Separator');
		});
	});
});
