const mongoose = require('mongoose');

var songSchema = new mongoose.Schema({
    title: String,
    duration: String,
    addedBy: String,
    addedById: String,
    url: String,
    thumbnail: String
});

var songModel = mongoose.model('Songs', songSchema);
module.exports = songModel;