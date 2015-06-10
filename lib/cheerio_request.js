
var
    request = require('request'),
    cheerio = require('cheerio');

module.exports = function (url, callback) {
    request({
        url: url
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, cheerio.load(body));
        } else {
            if (!error) {
                error = new Error('Unexpected response code ' + response.statusCode);
            }
            callback(error);
        }
    });
};
