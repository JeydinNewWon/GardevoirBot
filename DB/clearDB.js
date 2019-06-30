const songModel = require('./song');
const queueModel = require('./queue');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gardevoir', {useNewUrlParser: true}, (err) => {
    queueModel.deleteMany({}, () => {
        songModel.deleteMany({}, () => {
            console.log('done')
            mongoose.disconnect();
        });
    });
});
