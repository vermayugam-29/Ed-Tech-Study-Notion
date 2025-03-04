const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course'
        },
        rating: {
            type: String,
            required: true
        },
        review: {
            type: String,
            trim: true
        }
    }
);

module.exports = mongoose.model('RatingAndReview', ratingAndReviewSchema);