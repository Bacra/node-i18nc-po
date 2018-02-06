var fs        = require('fs');
var _         = require('lodash');
var inputData = require('./input.json');
var i18ncPO   = require('../');

var output = i18ncPO.create(inputData,
	{
		title: '第一份翻译稿v1.0',
		email: 'bacra.woo@gmail.com',
		pickFileLanguages: ['en-US']
	});

fs.writeFileSync(__dirname+'/output/all.po', output.po);
_.each(output.pot, function(content, filename)
{
	fs.writeFileSync(__dirname+'/output/'+filename+'.pot', content);
});
