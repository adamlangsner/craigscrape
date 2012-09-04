var    _ = require('underscore'),
   jsdom = require('jsdom'),
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
			var data = '';
			res.on('data', function(chunk) {
				data += (chunk);
			}).on('end', function() {
				
				jsdom.env({
					html: data,
					scripts: [
						'http://code.jquery.com/jquery-1.8.1.min.js'
					]}, function(err, window) {
						var $ = window.jQuery;
						$('p.row a').each(function() {

							jsdom.env($(this).attr('href'), [
								'http://code.jquery.com/jquery-1.8.1.min.js'
							], function(err, window) {
								this.$ = window.jQuery;


								var scripts = this.$('div#userbody script').detach();
								var bodySplit = this.$('div#userbody').text().split('START CLTAGS');

								var title = this.$('h2').text(),
									date = this.$('span.postingdate').text(),
									body = bodySplit[0];

								console.log(title);
								var matches = bodySplit[1].match(/CLTAG\s[a-zA-Z0-9]+?=[0-9a-zA-Z_.()\/\\:-]+/g);

								var location = {};
								_.each(matches, function(m) {
									var q = m.match(/CLTAG\s([a-zA-Z0-9]+?)=([0-9a-zA-Z_.()\/\\:-]+)/);
									location[q[1]] = q[2];
								});

								if (location['xstreet0'] && location['xstreet1'] && location['city'] && location['region'])
									location = location['xstreet0'] + ' at ' + location['xstreet1'] + ' ' + location['city'] + ', ' + location['region'];
								else
									location = 'NOT PROVIDED';
								console.log(location);
								console.log('------------------------------------------------------------');
							});
						})
					});

			});
		});

		request.end();
	}
};