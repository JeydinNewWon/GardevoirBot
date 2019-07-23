const youtubedl = require('youtube-dl');
const options = ["--default-search=auto", "--force-ipv4"];

function youtubeSearch(searchQuery, cb) {
    youtubedl.getInfo(searchQuery, options, (err, info) => {
        var data = {
            title: info.title,
            duration: info._duration_hms,
            url: info.webpage_url,
            thumbnail: info.thumbnails[0].url
        }
        cb(err, data);
    });
}

module.exports = youtubeSearch;