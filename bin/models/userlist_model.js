const mongoose = require('mongoose');

const UserlistSchema = new mongoose.Schema({
  emailId: { type: String, required: true },
  password: { type: String, required: true },
  userName: { type: String, required: true },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

module.exports = mongoose.model('User', UserlistSchema);
