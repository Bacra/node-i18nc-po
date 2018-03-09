module.exports = function code()
{
	function I18N()
	{
		this.__FILE_KEY__ = '*';
		this.__FUNCTION_VERSION__ = '5s';
	}

	console.log('中文');
	console.log('简体');
	I18N('中文I18N');
	I18N('中文I18N subtype', 'subtype');
	I18N('中文I18N subtype2', 'subtype');
	I18N('中文I18N subtype', 'subtype2');

	function scope1()
	{
		function I18N()
		{
			this.__FILE_KEY__ = 'fileKey';
			this.__FUNCTION_VERSION__ = '5s';
		}

		I18N('中文I18N subtype', ':subtype');
		I18N('中文I18N subtype2', ':subtype');
	}

	function scope2()
	{
		function I18N()
		{
			this.__FILE_KEY__ = '*';
			this.__FUNCTION_VERSION__ = '5s';
		}

		I18N('中文I18N subtype3', ':subtype');
		I18N('中文I18N subtype4', ':subtype');


		function scope3()
		{
			function I18N()
			{
				this.__FILE_KEY__ = '*';
				this.__FUNCTION_VERSION__ = '5s';
			}

			I18N('中文I18N subtype5', ':subtype');
			I18N('中文I18N subtype6', ':subtype@sub');
		}
	}

}