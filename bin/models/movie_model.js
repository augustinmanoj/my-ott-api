const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    name: { type: String, required: true },
    character: { type: String, required: false },
    photo: { type: String, required: false }
});

const movieSchema = new mongoose.Schema({
    movieId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: String, required: true },
    duration: { type: String, required: true },
    photo: { type: String, required: true },
    gridphoto: { type: String, required: true },
    CastData: [castSchema],
    videoUrl:{ type: String, required: true }
});

const Movie = mongoose.model('Movie', movieSchema);
const Cast = mongoose.model('Cast', castSchema);

module.exports = { Movie, Cast };
