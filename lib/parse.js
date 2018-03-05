var _         = require('lodash');
var PO        = require('node-po');
var debug     = require('debug')('i18nc-po:parse');
var extend    = require('extend');
var refsUtils = require('./refs_utils');

exports.parse = parse;
function parse(content)
{
	var poInfo = PO.parse(content);
	return _po2translateDBData(poInfo);
}



function _po2translateDBData(poInfo)
{
	var lan = poInfo.headers.Language;
	if (!lan) throw new Error('Language Not Found');

	var result = {};
	var fileKeyData = {};
	result[lan] = fileKeyData;

	poInfo.items.forEach(function(poItem)
	{
		if (!poItem.msgstr) return;
		var refs = poItem.references;
		if (!refs.length) refs = [undefined];

		var msgids = [];
		if (poItem.msgid) msgids.push(poItem.msgid);
		if (poItem.msgid_plural) msgids.push(poItem.msgid_plural);

		debug('msgids:%o, msgstr:%o, refs:%o', msgids, poItem.msgstr, refs);

		refs.forEach(function(ref)
		{
			msgids.forEach(function(msgid, index)
			{
				var msgstr = poItem.msgstr[index] || poItem.msgstr[0];
				var data = _oneRef_msgid_msgstr(ref, msgid, msgstr);
				if (data) extend(true, fileKeyData, data);
			});
		});
	});

	return result;
}

function _oneRef_msgid_msgstr(ref, msgid, msgstr)
{
	if (!msgid || !msgstr) return;

	var info;
	if (!ref || ref.substr(0, 2) != '@@')
		debug('ignore ref for parse:%s', ref);
	else
		info = refsUtils.parse(ref.substr(2));

	if (!info) info = {};
	if (!info.fileKey) info.fileKey = '*';

	var extendData1 = {};
	var extendData2 = {};
	switch(info.type)
	{
		case refsUtils.TYPES.SUBTYPE:
			extendData1[msgid] = msgstr;
			extendData2[info.subtype] = extendData1;
			extendData2 = {SUBTYPES: extendData2};
			break;

		case refsUtils.TYPES.SIMPLE_LINE:
		case refsUtils.TYPES.LINE:
			info.msgid = msgid;
			info.msgstr = msgstr;
			var translateData = refsUtils.mixMsgsByJoinIndexs(info);
			_.each(translateData, function(data, subkey)
			{
				var subtype = subkey == '*' ? info.subtype : info.subtype+'@'+subkey;
				extendData1[subtype] = data;
			});
			extendData2.SUBTYPES = extendData1;
			break;


		default:
		case refsUtils.TYPES.BASE:
			extendData1[msgid] = msgstr;
			extendData2.DEFAULTS = extendData1;
			break;

	}

	extendData1 = {};
	extendData1[info.fileKey] = extendData2;

	debug('ref:%s msgid:%s msgstr:%s result:%o', ref, msgid, msgstr, extendData1);

	return extendData1;
}
