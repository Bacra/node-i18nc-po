var inputData = require('./input.json');
var Creator = require('../lib/create');

// console.log(inputData);
console.log(Creator.create(inputData,
	{
		title: '第一份翻译稿v1.0',
		email: 'bacra.woo@gmail.com'
	}));
