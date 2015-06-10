
var
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    cheerioRequest = require('./lib/cheerio_request');

var
    SCRIPTS_DIR = path.resolve(__dirname, '..', 'scripts'),
    BASE_URL = 'http://www.seinology.com';


/**
 * Returns the full file path equivalent to the link passed as parameter.
 *
 * @param link the URL to the script
 * @returns {string} the full file path
 */
function scriptLinkToFilename(link) {
    var
        filename;

    filename = url.parse(link).pathname.replace(/^.*\/([^/]+)\.[^.]*$/, '$1.txt');
    return path.join(SCRIPTS_DIR, filename);
}

/**
 * Get a script.
 *
 * @param link the URL to link script's page
 * @param next function to call when download is complete
 */
function getScript(link, next) {

    cheerioRequest(link, function (error, $) {
        var
            filename, text;

        if (!error) {

            text = $('.spacer2').text();

            fs.writeFileSync(scriptLinkToFilename(link), text);

            console.info('"' + filename + '" is done.');
        }

        next(error);
    });
}

/**
 * Manages the downloading of all scripts, limiting the rate of concurrent downloads.
 *
 * @param links an array of links to each script to be downloaded
 * @param next function to call when everything is done
 */
function getScripts(links, next) {

    async.eachLimit(links, 4, getScript, next);
}

/**
 * Check which scripts were already downloaded and remove them from the download list.
 *
 * @param links
 * @param next
 */
function pruneAlreadyDownloaded(links, next) {

    links = links.filter(function (link) {
        var
            stat,
            keep = false,
            filename = scriptLinkToFilename(link);

        try {
            stat = fs.statSync(filename);
            keep = !stat.isFile() || (stat.size == 0);
        } catch (e) {
            if (e.code !== 'ENOENT') {
                next(e);
            }
        }

        if (!keep) {
            console.info('"' + filename + '" already exists and will not be downloaded.');
        }

        // File does not exist; must be kept on the list
        return keep;
    });

    next(null, links);
}

/**
 * Get the scripts index page, where we find individual links to each script.
 *
 * @param next function to call when everything is done
 */
function getScriptUrls(next) {
    var
        INDEX_URL = url.resolve(BASE_URL, '/scripts-english.shtml');

    cheerioRequest(INDEX_URL , function (error, $) {
        var
            links;

        if (!error) {

            links = $('a[href*="scripts/script-"]');

            links = links.map(function () {
                return url.resolve(BASE_URL, $(this).attr('href'));
            }).get();
        }

        next(error, links);
    });
}

(function main() {

    async.waterfall([
        getScriptUrls,
        pruneAlreadyDownloaded,
        getScripts
    ], function (error) {

        if (error) {
            console.error(error);
        } else {
            console.info('All scripts were downloaded successfully.');
        }
    });
})();
