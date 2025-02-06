const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    contentId: { type: String, required: true },
    contentType: { type: String, required: true, enum: ['movie', 'webseries'] },
    addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
