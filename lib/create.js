var _ = require('lodash');
var util = require('util');
var debug = require('debug')('i18nc-po');
var PO = require('node-po');

var CONTENT_HEADERS =
{
	title: 'Project-Id-Version',
	email: 'Report-Msgid-Bugs-To',
};

var SYS_COMMENT_PRE = '@@';

exports.create = function create(json, options)
{
	return json2po(getTranslateWords(json), options);
}


function getTranslateWords(json)
{
	var fileKey = json.currentFileKey;
	var items = {};
	json.codeTranslateWords.DEFAULTS.forEach(function(msgid)
	{
		var item = items[msgid] || (items[msgid] = new TPOItem(msgid));
		item.addFileKey(fileKey);
	});

	_.each(json.codeTranslateWords.SUBTYPES, function(arr, subtype)
	{
		var msgid = arr.join('%s');
		var item = items[msgid] || (items[msgid] = new TPOItem(msgid));
		item.addFileKey(fileKey);
	});

	json.subScopeDatas.forEach(function(subScopeData)
	{
		var ret = getTranslateWords(subScopeData);
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

	return items;
}


function json2po(items, options)
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

	po.comments.push('Create by I18NC PO');

	if (options.srcFile)
	{
		po.comments.push(util.format('%s srcfile: %s', SYS_COMMENT_PRE, options.srcFile));
	}

	po.items = items.map(function(item)
	{
		return item.toPOItem();
	});

	return po.toString();
}


function TPOItem(msgid)
{
	this.msgid = msgid;
	this.fileKeys = {};
}

_.extend(TPOItem.prototype,
{
	toPOItem: function()
	{
		var item = new PO.Item();
		item.msgid = this.msgid;

		return item;
	},
	addFileKey: function(fileKey)
	{
		if (!this.fileKeys[fileKey])
		{
			this.fileKeys[fileKey] = 0;
		}

		this.fileKeys[fileKey]++;
	},
	merge: function(item)
	{
		var self = this;
		_.each(item.fileKeys, function(fileKey)
		{
			self.addFileKey(fileKey);
		});
	}
});
