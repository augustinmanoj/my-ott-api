const express = require('express');
const WebSeries = require('../bin/models/web_series_model'); 
const { authorize } = require('../bin/models/authorize');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const webSeries = await WebSeries.find();
    res.json(webSeries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch web series', details: error });
  }
});

router.get('/series/:seriesid', async (req, res) => {
  try {
    const webSeries = await WebSeries.findOne({ seriesId: req.params.seriesid });
    if (!webSeries) {
      return res.status(404).json({ message: 'Web series not found' });
    }
    res.json(webSeries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the web series', details: error });
  }
});

router.post('/newseries',authorize, async (req, res) => {
  try {
    const newWebSeries = await WebSeries.create(req.body); 
    if (!req.body.seriesId) {
      return res.status(400).json({ error: "seriesId is required and cannot be null" });
    }
    
    res.status(201).json(newWebSeries);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create the web series', details: error });
  }
});


router.put('/updateseries/:id', authorize,async (req, res) => {
  try {
    const updatedWebSeries = await WebSeries.findOneAndUpdate(
      { seriesId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedWebSeries) {
      return res.status(404).json({ message: 'Web series not found' });
    }
    res.json(updatedWebSeries);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update the web series', details: error });
  }
});

router.delete('/deleteseries/:id',authorize, async (req, res) => {
  try {
    const deletedWebSeries = await WebSeries.findOneAndDelete({ seriesId: req.params.id });
    if (!deletedWebSeries) {
      return res.status(404).json({ message: 'Web series not found' });
    }
    res.json({ message: 'Web series deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the web series', details: error });
  }
});


 router.post('/:id/episodes', async (req, res) => {
  try {
    const webSeries = await WebSeries.findOne({ seriesId: req.params.id });
    if (!webSeries) {
      return res.status(404).json({ message: 'Web series not found' });
    }
    webSeries.episodes.push(req.body);
    const updatedWebSeries = await webSeries.save();
    res.status(201).json(updatedWebSeries);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add the episode', details: error });
  }
});

module.exports = router;
