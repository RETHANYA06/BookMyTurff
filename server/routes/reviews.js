const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

// Post a review
router.post('/', async (req, res) => {
    try {
        const { turf_id, player_id, player_name, rating, comment } = req.body;

        if (!turf_id || !player_id || !rating) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Prevent duplicate reviews from the same player for the same turf
        const existing = await Review.findOne({ turf_id, player_id });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this turf. You can only submit one review per turf.' });
        }

        const review = new Review({
            turf_id,
            player_id,
            player_name,
            rating,
            comment
        });

        await review.save();

        // Recalculate average rating from all reviews
        const reviews = await Review.find({ turf_id });
        const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

        await Turf.findByIdAndUpdate(turf_id, {
            rating: parseFloat(avgRating.toFixed(1)),
            reviews_count: reviews.length
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get reviews for a turf
router.get('/:turfId', async (req, res) => {
    try {
        const reviews = await Review.find({ turf_id: req.params.turfId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if a player has already reviewed a turf
router.get('/check/:turfId/:playerId', async (req, res) => {
    try {
        const review = await Review.findOne({ turf_id: req.params.turfId, player_id: req.params.playerId });
        res.json({ hasReviewed: !!review, review: review || null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
