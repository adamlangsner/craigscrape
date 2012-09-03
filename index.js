var    _ = require('underscore'),
	http = require('http'),
	zlib = require('zlib');

var defaultParameters = {
};

var constructPath = function (housing_type, parameters) {
	var hasParams = parameters && !_.isEmpty(parameters);
	
	var path = '/' + (hasParams ? 'search' : '');

	path += '/' + housing_type;

	if (hasParams) {
		var pairs = _.map(parameters, function(v, k) { return k + "=" + v; });
		path += '?' + pairs.join('&');
	}


	// /search/roo/brk?query=williamsburg&srchType=A&minAsk=&maxAsk=1000&hasPic=1

	console.log(path);
	return path;
}

module.exports = {
	find: function(city, housing_type, parameters, callback) {
		
		// support call style: "find(city, housing_type, callback)"
		if (_.isFunction(parameters) && _.isUndefined(callback)) {
			callback = parameters;
			parameters = defaultParameters;
		}

		// add defaults and potentially initialize parameters object 
		parameters = _.extend(parameters || {}, defaultParameters);

		var request = http.request({
			host: city+'.craigslist.org',
			path: constructPath(housing_type, parameters),
			method: 'GET' 
		}, function(res) {
			if (callback) {
				callback(res);
			}
		});

		request.end();
	}
};