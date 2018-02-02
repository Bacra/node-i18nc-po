var _ = require('lodash');
var util = require('util');
var debug = require('debug')('i18nc-po');
var PO = require('node-po');

var CONTENT_HEADERS =
{
	title: 'Project-Id-Version',
	email: 'Report-Msgid-Bugs-To',
};

exports.create = function create(json, options)
{
	if (!options) options = {};

	var result = {pot: {}};
	if (options.pickFileLanguages && options.pickFileLanguages.length)
	{
		_.each(options.pickFileLanguages, function(lan)
		{
			var items = filterTranslateWords(json, lan);
			result.pot[lan] = json2po(items, lan, options);
		});
	}

	var items = filterTranslateWords(json);
	result.po = json2po(items, null, options);

	return result;
}


function filterTranslateWords(json, lan)
{
	if (!json) json = {};

	var fileKey = json.currentFileKey;
	var items = {};
	var translateData = json.usedTranslateWords && json.usedTranslateWords[lan] || {};
	var codeTranslateWords = json.codeTranslateWords || {};
	_.each(codeTranslateWords.DEFAULTS, function(msgid)
	{
		if (!translateData.DEFAULTS || !translateData.DEFAULTS[msgid])
		{
			var item = items[msgid] || (items[msgid] = new TPOItem(msgid));
			item.addKeyInfo(fileKey);
		}
	});

	_.each(codeTranslateWords.SUBTYPES, function(arr, subtype)
	{
		var DBItem = translateData.SUBTYPES && translateData.SUBTYPES[subtype];
		var DBKeys = DBItem ? _.keys(DBItem) : [];
		var isDiff = DBKeys.length != arr.length || _.difference(arr, DBKeys);

		if (isDiff)
		{
			var msgid = arr.join('%s');
			var joinstr = [];
			var jointmp = [];
			var arrIndex = 0;
			msgid.split('%s').forEach(function(val, index)
			{
				jointmp.push(val);
				if (jointmp.join('%s') == arr[arrIndex])
				{
					jointmp = [];
					arrIndex++;
					joinstr.push(index);
				}
			});

			var item = items[msgid] || (items[msgid] = new TPOItem(msgid));
			item.addKeyInfo(fileKey, subtype, joinstr);
		}
	});

	_.each(json.subScopeDatas, function(subScopeData)
	{
		var ret = filterTranslateWords(subScopeData, lan);
		_.each(ret, function(item, msgid)
		{
			if (items[msgid])
			{
				items[msgid].merge(item);
			}
			else
			{
				items[msgid] = item;
			}
		});
	});

	debug('get words, subScopeDatas:%d, item:%d',
		json.subScopeDatas && json.subScopeDatas.length, items.length);

	return items;
}


function json2po(items, lan, options)
{
	var po = new PO();

	// 设置文件头部信息
	['title', 'email'].forEach(function(key)
	{
		var val = options[key];
		if (val)
		{
			po.headers[CONTENT_HEADERS[key]] = val;
		}
	});

	po.headers['Content-Type'] = 'text/plain; charset=UTF-8';
	po.headers['Content-Transfer-Encoding'] = '8bit';
	po.headers['Content-Type'] = 'text/plain';

	po.comments.push('Create by I18NC PO');

	po.items = _.map(items, function(item)
	{
		return item.toPOItem();
	});

	return po.toString();
}


function TPOItem(msgid)
{
	this.msgid = msgid;
	this.fileInfos = {};
}

_.extend(TPOItem.prototype,
{
	toPOItem: function()
	{
		var item = new PO.Item();
		item.msgid = this.msgid;
		item.references = _.map(this.fileInfos, function(num, fileInfo)
			{
				return '@@'+fileInfo;
			});

		debug('item references:%o', item.references);

		return item;
	},
	/**
	 * joinstr %s分割的位置，防止原来需要翻译的文章中，就有%s这样的内容
	 */
	addKeyInfo: function(fileKey, subtype, joinstr)
	{
		var fileInfo;
		if (subtype)
		{
			fileInfo = [
				1,		// 标志位
				joinstr.length,
				joinstr.join(','),
				subtype.length,
				subtype
			];

			debug('subtype2fileinfo %o', fileInfo);
		}
		else
		{
			fileInfo = ['0'];
		}

		if (fileKey) fileInfo.push(fileKey);

		this._addKeyInfo(fileInfo);
	},
	_addKeyInfo: function(fileInfo)
	{
		if (!this.fileInfos[fileInfo])
		{
			this.fileInfos[fileInfo] = 0;
		}

		this.fileInfos[fileInfo]++;
	},
	merge: function(item)
	{
		var self = this;
		_.each(item.fileInfos, function(fileInfo)
		{
			self._addKeyInfo(fileKey);
		});
	}
});
