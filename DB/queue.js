const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    guildId: String,
    songs: [],
    repeat: Boolean,
    skipVotes: []
});

queueSchema.methods.addSong = function addSong(song, cb) {
    this.model('Queues').updateOne({ _id: this._id }, { $push: { songs: song } }, (err) => {
        cb(err);
    });
}

queueSchema.methods.removeOldest = function removeOldest(cb) {
    this.model('Queues').updateOne({ _id: this._id }, { $pop: { songs: -1 } }, (err) => {
        this.model('Queues').findOne({_id: this._id}, (err, Queue) => {
            cb(err, Queue.songs);
        });
    });
}

queueSchema.methods.addVote = function addVote(vote, cb) {
    this.model('Queues').updateOne({ _id: this._id }, { $addToSet: { skipVotes: vote } }, (err) => {
        if (err) {
            return cb(err);
        }
        cb();
    });
}

queueSchema.methods.checkVotes = function checkVote(totalMembers, cb) {
    this.model('Queues').findOne({ _id: this._id }, (err, Queue) => { 
        if (Queue.skipVotes.length >= Math.round(totalMembers/2)) {
            cb(err, true);
        } else {
            cb(err, false);
        }
    });
}

queueSchema.methods.setRepeat = function setRepeat(cb) {
    this.model('Queues').updateOne({ _id: this._id }, { $set: { repeat: !this.repeat } }, (err) => {
        cb(err, !this.repeat);
    });
}

var queueModel = mongoose.model('Queues', queueSchema);
module.exports = queueModel;