var _ = require('lodash');
var fs = require('fs');


exports.requireAfterWrite = function requireAfterWrite(filename, data, options)
{
	var file = __dirname+'/output/'+filename;
	if (!process.env.TEST_BUILD) return _requireOrFs(file, options);

	if (typeof data == 'object')
	{
		data = JSON.stringify(data, null, '\t');
	}

	fs.writeFileSync(file, data);

	return _requireOrFs(file, options);
}

function _requireOrFs(file, options)
{
	options || (options = {});

	switch(options.readMode)
	{
		case 'string':
			return fs.readFileSync(file, {encoding: 'utf8'});

		default:
			return require(file);
	}
}


exports.code2arr = function code2arr(code)
{
	return code.split('\n')
		.filter(function(val)
		{
			return val.trim();
		});
}
