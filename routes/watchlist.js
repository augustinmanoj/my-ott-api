const express = require('express');
const router = express.Router();
const Watchlist = require('../bin/models/watchlist_model');
const {Movie} = require('../bin/models/movie_model');
const WebSeries = require('../bin/models/web_series_model');

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const watchlistItems = await Watchlist.find({ userId });

        const movieIds = watchlistItems
            .filter(item => item.contentType === 'movie')
            .map(item => item.contentId);

        const webSeriesIds = watchlistItems
            .filter(item => item.contentType === 'webseries')
            .map(item => item.contentId);

        const moviesPromise = Movie.find({ movieId: { $in: movieIds } });
        const webSeriesPromise = WebSeries.find({ seriesId: { $in: webSeriesIds } });
        const [movies, webSeries] = await Promise.all([moviesPromise, webSeriesPromise]);
        res.status(200).json({
            movies,
            webSeries,
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Error fetching watchlist', error });
    }
});


router.post('/', async (req, res) => {
    const { userId, contentId, contentType } = req.body;

    try {
        const existingEntry = await Watchlist.findOne({ userId, contentId, contentType });
        if (existingEntry) {
            return res.status(400).json({ message: 'Item already in watchlist' });
        }
        const newEntry = new Watchlist({ userId, contentId, contentType });
        await newEntry.save();

        res.status(201).json({ message: 'Item added to watchlist', newEntry });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Error adding to watchlist', error });
    }
});

router.delete('/remove', async (req, res) => {
    const { userId, contentId, contentType } = req.body;

    try {
        const result = await Watchlist.findOneAndDelete({ userId, contentId, contentType });
        if (!result) {
            return res.status(404).json({ message: 'Item not found in watchlist' });
        }

        res.status(200).json({ message: 'Item removed from watchlist' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: 'Error removing from watchlist', error });
    }
});

module.exports = router;
