const express = require('express');
const router = express.Router();
const { Movie } = require('../bin/models/movie_model');
const {authorize, authenticateAdmin} = require('../bin/models/authorize');
router.get('/movielist',async (req, res) => {
    try {
        let result = await Movie.find();
        res.json(result);
    } catch (err) {
        console.error('Error fetching movie list:', err);
        res.status(500).json({ error: 'Failed to fetch movie list' });
    }
});

router.post('/newmovielist',authenticateAdmin, async (req, res) => {
  try {
      const newMovieData = req.body;
      console.log('Request Body:', newMovieData);

      if (!newMovieData.CastData || !Array.isArray(newMovieData.CastData)) {
          return res.status(400).json({ error: 'CastData must be an array' });
      }

      const result = await Movie.create(newMovieData);
      console.log('Movie created successfully:', result);
      res.status(201).json(result);
  } catch (err) {
      console.error('Error creating movie:', err);
      res.status(500).json({ error: 'Failed to create new movie' });
  }
});

router.delete('/deletelist',authorize,authenticateAdmin, async (req, res) => {
    try {
        const { movieId } = req.body; 
        let result = await Movie.deleteOne({ movieId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        console.error('Error deleting movie:', err);
        res.status(500).json({ error: 'Failed to delete movie' });
    }
});

router.put('/updatelist',authenticateAdmin,async (req, res) => {
    try {
        const { movieId, updates } = req.body;
        let result = await Movie.updateOne({ movieId }, updates);
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie updated successfully' });
    } catch (err) {
        console.error('Error updating movie:', err);
        res.status(500).json({ error: 'Failed to update movie' });
    }
});

router.get('/:movieId', authorize,async (req, res) => {
    try {
        const { movieId } = req.params;  
        let result = await Movie.findOne({ movieId }); 
        if (result.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }   
        res.json(result); 
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
});


module.exports = router;
