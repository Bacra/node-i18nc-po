var debug = require('debug')('i18nc-po:refs_utils');

exports.generate = function(fileKey, subtype, msgs)
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
};

exports.parse = function(refstr, msgid)
{
	var info = refstr.split(',');
	switch(info[0])
	{
		case '0':
			return {
				fileKey: refstr.substr(2),
				subtype: undefined,
				msgs: [msgid]
			};

		case '1':
			return _parseKey1(refstr, msgid, info);

		default:
			throw new Error('ERROR_REF_TYPE');
	}
};





function _genKeyWidthSubtype(fileKey, subtype, msgs)
{
	if (!subtype || !msgs || !msgs.length) throw new Error('ERROR_INPUT');

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
function _parseKey1(refstr, msgid, info)
{
	if (!info) info = refstr.split(',');

	var joinLen = +info[1];
	if (isNaN(joinLen)) throw new Error('ERROR_FORMAT:JOIN_LENGTH');
	var subtypeLen = +info[joinLen+2];
	if (isNaN(subtypeLen)) throw new Error('ERROR_FORMAT:SUBTYPE_LENGTH');
	// headArr: 协议,joinLen,joinIndexs,subtypeLen
	var headArr = info.slice(0, joinLen+3);
	var headStr = headArr.join(',');
	// tailStr: subtype,fileKey
	var tailStr = refstr.substr(headStr.length+1);

	debug('joinLen:%d subtypeLen:%d headStr:%s tailStr:%s',
		joinLen, subtypeLen, headStr, tailStr);

	var fileKeySplit = tailStr[subtypeLen];
	var fileKey = tailStr.substr(subtypeLen+1);

	if (!(fileKey && fileKeySplit == ',') && !(!fileKey && fileKeySplit === undefined))
	{
		debug('err fileKey split:%s fileKey:%s', fileKeySplit, fileKey);
		throw new Error('ERROR_FORMAT:FILE_KEY_SPLIT');
	}
	var subtype = tailStr.substr(0, subtypeLen);
	if (subtype.length != subtypeLen)
	{
		debug('subtype err:%s len:%d', subtype, subtypeLen);
		throw new Error('ERROR_FORMAT:SUBTYPE_LENGTH');
	}

	var joinIndexs = headArr.slice(2).map(function(val)
		{
			if (isNaN(val)) throw new Error('ERROR_FORMAT:JOIN_INDEX');
			return +val;
		});


	// 根据joinIndexs 切分msgid
	var msgs      = [];
	var tmpMsg    = [];
	var joinIndex = 0;
	msgid.split('%s').forEach(function(msg, index)
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

	debug('type 1, data, filekey:%s subtype:%s msgs:%o', fileKey, subtype, msgs);

	return {
		fileKey : fileKey,
		subtype : subtype,
		msgs    : msgs
	};
}
