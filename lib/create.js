var _         = require('lodash');
var PO        = require('node-po');
var util      = require('util');
var debug     = require('debug')('i18nc-po:create');
var refsUtils = require('./refs_utils');

var CONTENT_HEADERS =
{
	title: 'Project-Id-Version',
	email: 'Report-Msgid-Bugs-To',
};

exports.defaults =
{
	pickFileLanguages: [],
	email: undefined,
	title: 'I18N Project - Create By I18NC Tool',
	// 针对已有翻译数据的筛选
	// ignore  不打包
	// keep    将内容打包到文件
	// empty   清空翻译内容输出
	existedTranslateFilter: 'ignore',
};

exports.create = create;
function create(json, options)
{
	options = _.extend({}, exports.defaults, options);

	var pickFileLanguages = options.pickFileLanguages;
	if (!pickFileLanguages || !pickFileLanguages.length)
	{
		pickFileLanguages = _getCodeUsedLans(json);
	}

	var result = {po: {}};
	if (pickFileLanguages && pickFileLanguages.length)
	{
		_.each(pickFileLanguages, function(lan)
		{
			var items = filterTranslateWords(json, lan, options.existedTranslateFilter);
			result.po[lan] = json2pot(items, lan, options);
		});
	}

	var items = filterTranslateWords(json, null, 'ignore');
	result.pot = json2pot(items, null, options);

	return result;
}

function filterTranslateWords(json, lan, existedTranslateFilter)
{
	if (!json) json = {};

	var fileKey = json.currentFileKey;
	var items = {};
	var translateData = json.usedTranslateWords && json.usedTranslateWords[lan] || {};
	var codeTranslateWords = json.codeTranslateWords || {};
	_.each(codeTranslateWords.DEFAULTS, function(msgid)
	{
		var msgstr = translateData.DEFAULTS && translateData.DEFAULTS[msgid];
		if (msgstr !== undefined)
		{
			if (existedTranslateFilter == 'ignore') return;
			else if (existedTranslateFilter == 'empty') msgstr = undefined;
		}
		var key = msgid+':'+msgstr;
		var item = items[key] || (items[key] = new TPOItem(msgid, msgstr));
		item.addKeyInfo(fileKey);
	});

	_.each(codeTranslateWords.SUBTYPES, function(arr, subtype)
	{
		var DBItem = translateData.SUBTYPES && translateData.SUBTYPES[subtype];
		var DBKeys = DBItem ? _.keys(DBItem) : [];
		var isDiff = DBKeys.length != arr.length || _.difference(arr, DBKeys);
		var msgstr;

		if (!isDiff)
		{
			if (existedTranslateFilter == 'ignore')
			{
				return;
			}
			else if (existedTranslateFilter != 'empty')
			{
				msgstr = arr.map(function(word){return DBItem[word]}).join('%s');
			}
		}

		var msgid = arr.join('%s');
		var key = msgid+':'+msgstr;
		var item = items[key] || (items[key] = new TPOItem(msgid, msgstr));
		item.addKeyInfo(fileKey, subtype, arr);
	});

	_.each(json.subScopeDatas, function(subScopeData)
	{
		var ret = filterTranslateWords(subScopeData, lan, existedTranslateFilter);
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


function json2pot(items, lan, options)
{
	var poInfo = new PO();

	// 设置文件头部信息
	['title', 'email'].forEach(function(key)
	{
		var val = options[key];
		if (val)
		{
			poInfo.headers[CONTENT_HEADERS[key]] = val;
		}
	});

	poInfo.headers['Content-Type'] = 'text/plain; charset=UTF-8';
	poInfo.headers['Content-Transfer-Encoding'] = '8bit';
	poInfo.headers['MIME-Versio'] = '1.0';
	poInfo.headers['X-Generator'] = 'I18NC-PO';

	if (lan) poInfo.headers['Language'] = lan;

	poInfo.comments.push('Create by I18NC PO');

	poInfo.items = _(items)
		.values()
		.sort(function(a, b)
		{
			return a.msgid > b.msgid ? 1 : -1;
		})
		.map(function(item)
		{
			return item.toPOItem();
		})
		.value();

	return poInfo.toString();
}


function TPOItem(msgid, msgstr)
{
	this.msgid = msgid;
	this.msgstr = msgstr;
	this.fileInfos = {};
}

_.extend(TPOItem.prototype,
{
	toPOItem: function()
	{
		var item = new PO.Item();
		item.msgid = this.msgid;
		if (this.msgstr !== undefined) item.msgstr = this.msgstr;
		item.references = _.map(this.fileInfos, function(num, fileInfo)
			{
				return '@@'+fileInfo;
			});

		debug('item references:%o', item.references);

		return item;
	},
	addKeyInfo: function(fileKey, subtype, msgs)
	{
		this._addKeyInfo(refsUtils.generate(fileKey, subtype, msgs));
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
		_.each(item.fileInfos, function(num, fileInfo)
		{
			self._addKeyInfo(fileInfo);
		});
	}
});



exports._getCodeUsedLans = _getCodeUsedLans;
/**
 * 获取
 * @param       {JSON} json  i18nc返回json
 * @return      {Array}      翻译语言
 */
function _getCodeUsedLans(json)
{
	var result = [];

	_.each(json.funcTranslateWords, function(lans)
	{
		result.push.apply(result, _.keys(lans));
	});

	_.each(json.usedTranslateWords, function(words, lan)
	{
		result.push(lan);
	});

	result = result.concat.apply(result, _.map(json.subScopeDatas, _getCodeUsedLans));

	return _.uniq(result);
}
