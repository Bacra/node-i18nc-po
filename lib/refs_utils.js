var debug = require('debug')('i18nc-po:refs_utils');

exports.generate = generate;
function generate(fileKey, subtype, msgs)
{
	if (subtype)
	{
		return _genKeyWidthSubtype(fileKey, subtype, msgs);
	}
	else
	{
		var ret = [0];
		if (fileKey) ret.push(fileKey);
		return ret.join(',');
	}
}

exports.parse = parse;
function parse(refstr)
{
	var info = refstr.split(',');
	switch(info[0])
	{
		case '0':
			return {
				fileKey: refstr.substr(2),
			};

		case '1':
			return _parseKey1(refstr, info);

		default:
			throw new Error('Ref String Type Is Not Support');
	}
}

/**
 * 通过joinIndexs，将msgid和msgstr融合到一起
 */
exports.mixMsgsByJoinIndexs = mixMsgsByJoinIndexs;
function mixMsgsByJoinIndexs(msgid, msgstr, joinIndexs)
{
	var arr1 = _splitMsgByJoinIndexs(msgid, joinIndexs);
	var arr2 = _splitMsgByJoinIndexs(msgstr, joinIndexs);

	if (arr1.length != arr2.length)
	{
		throw new Error('Miss Message Separator');
	}
	if (arr1[arr1.length-1].split('%s').length != arr2[arr2.length-1].split('%s').length)
	{
		throw new Error('Miss Message Separator');
	}

	var result = {};
	arr1.forEach(function(val, index)
	{
		result[val] = arr2[index];
	});

	return result;
}




/**
 * 将带有subtype的数据生成type1的结构体
 */
function _genKeyWidthSubtype(fileKey, subtype, msgs)
{
	if (!subtype || !msgs || !msgs.length) throw new Error('Error Input');

	var msgid = msgs.join('%s');
	var joinIndexs = [];
	var joinIndex = -1;
	msgs.forEach(function(msg)
	{
		if (joinIndex != -1) joinIndexs.push(joinIndex);
		joinIndex += msg.split('%s').length;
	});

	var ret;

	if (joinIndexs.length)
	{
		ret =
		[
			1,		// 标志位
			joinIndexs.length,
			joinIndexs.join(','),
			subtype.length,
			subtype
		];
	}
	else
	{
		ret =
		[
			1,		// 标志位
			0,
			subtype.length,
			subtype
		];
	}

	if (fileKey) ret.push(fileKey);
	return ret.join(',');
}



/**
 * 将类似于 1,1,1,7,subtype,fileKe 这种路径
 * 解析成相应的数据
 */
function _parseKey1(refstr, info)
{
	if (!info) info = refstr.split(',');

	var joinLen = +info[1];
	if (isNaN(joinLen) || joinLen < 0) throw new Error('JoinIndexs Length Is Wrong');

	// headArr: 协议,joinLen,joinIndexs,subtypeLen
	var headArr = info.slice(0, joinLen+3);
	var headStr = headArr.join(',');
	// tailStr: subtype,fileKey
	var tailStr = refstr.substr(headStr.length+1);

	var joinIndexs = headArr.slice(2, joinLen+2).map(function(val)
		{
			if (isNaN(val) || val < 0) throw new Error('JoinIndex Is Wrong');
			return +val;
		});


	var subtypeLen = +info[joinLen+2];
	debug('joinLen:%d subtypeLen:%d headStr:%s tailStr:%s',
		joinLen, subtypeLen, headStr, tailStr);

	if (isNaN(subtypeLen) || subtypeLen < 0) throw new Error('Subtype Length Is Wrong');
	var subtype = tailStr.substr(0, subtypeLen);
	if (subtype.length != subtypeLen)
	{
		debug('subtype err:%s len:%d', subtype, subtypeLen);
		throw new Error('Subtype String Length Is Wrong');
	}


	var fileKeySplit = tailStr[subtypeLen];
	var fileKey = tailStr.substr(subtypeLen+1);
	if (!(fileKey && fileKeySplit == ',') && !(!fileKey && fileKeySplit === undefined))
	{
		debug('err fileKey split:%s fileKey:%s', fileKeySplit, fileKey);
		throw new Error('FileKey Separator Is Wrong');
	}

	debug('filekey:%s subtype:%s', fileKey, subtype);
	return {
		fileKey    : fileKey,
		subtype    : subtype,
		joinIndexs : joinIndexs
	};
}

/**
 * 将字符串根据joinIndexs进行切分
 * for test
 */
exports._splitMsgByJoinIndexs = _splitMsgByJoinIndexs;
function _splitMsgByJoinIndexs(msg, joinIndexs)
{
	// 根据joinIndexs 切分msgid
	var msgs      = [];
	var tmpMsg    = [];
	var joinIndex = 0;
	msg.split('%s').forEach(function(msg, index)
	{
		tmpMsg.push(msg);
		if (joinIndexs[joinIndex] == index)
		{
			joinIndex++;
			msgs.push(tmpMsg.join('%s'));
			tmpMsg = [];
		}
	});
	if (tmpMsg.length) msgs.push(tmpMsg.join('%s'));

	return msgs;
}
