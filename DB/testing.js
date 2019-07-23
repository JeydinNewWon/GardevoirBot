const youtubedl = require('youtube-dl');
const options = ["--default-search=auto"];

function youtubeSearch(searchQuery, cb) {
    youtubedl.getInfo(searchQuery, options, (err, info) => {
        console.log(err);
        var data = {
            title: info.title,
            duration: info._duration_hms,
            url: info.webpage_url,
            thumbnail: info.thumbnails[0].url
        }
        cb(err, data);
    });
}

youtubeSearch("when leblanc gets reverted", (err, data) => {
    console.log(data);
});
