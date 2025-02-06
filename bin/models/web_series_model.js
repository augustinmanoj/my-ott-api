const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  seriesId: { type: String, required: true},
  title: { type: String, required: true },
  duration: { type: String, required: true },
  thumbnail: { type: String, required: true },
  videoUrl:{ type: String, required: true }
});

const WebSeriesSchema = new mongoose.Schema({
  seriesId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  episodes: [EpisodeSchema],
  bannerImage: { type: String, required: true },
  gridPhoto:{type: String, required: true}
});

module.exports = mongoose.model('WebSeries', WebSeriesSchema);
