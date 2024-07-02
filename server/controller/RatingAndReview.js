const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const mongoose = require('mongoose');


//create rating
exports.createRating = async (req, res) => {
    try {
        const { rating, review, courseId } = req.body;
        const id = req.user.id;

        //check if even user has purchased this course or not
        const coursePurchased = await Course.findOne({
            _id: courseId,
            studentsEnrolled: {
                $elemMatch:
                    { $eq: id }
            }
        });
        if (!coursePurchased) {
            return res.status(404).json({
                success: false,
                message: 'Please purchase the course before giving rating it'
            })
        }

        //check if user has already given review on the course
        // const courseReviewed = await  Course.findOne({
        //     _id : courseId ,
        //     ratingAndReviews : {$elemMatch : 
        //         {$eq : id}
        //     }
        // });
        const courseReviewed = await RatingAndReview.findOne(
            { course: courseId, user: id }
        );
        if (courseReviewed) {
            return res.status(401).json({
                success: false,
                message: 'You have already rated  the course'
            })
        }

        const ratingCourse = await RatingAndReview.create({
            user: id, course: courseId, rating, review
        });

        await Course.findByIdAndUpdate(
            { _id: courseId },
            { $push: { ratingAndReviews: ratingCourse._id } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course reviewwed successfully',
            data: ratingCourse
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong while rating the courses',
            error: error.message
        })
    }
}

//average rating
exports.getAverageRating = async (req, res) => {
    try {
        const { courseId } = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match: { //esi entries find out  karo jiski courseId ye ho
                    course: new mongoose.Types.ObjectId(courseId),
                }
            } ,
            {
                $group : {
                    _id : null,
                    averateRating : { $avg : '$rating' }
                }
            }
        ])
        
        if (result.length > 0) {
            return res.status(200).json({
                success : true ,
                data : result[0], //average rating
                message : 'Successfully fetched average rating of course'
            })
        }

        return res.status(200).json({
            success : true,
            data : 0 , //average rating
            message : 'No rating given till now'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while fetching average rating',
            error : error.message
        })
    }
}

//get all rating
exports.getAllRatings = async(req , res) => {
    try {
        const allRatings = await RatingAndReview.find({})
                            .sort({rating : 'desc'})   
                            .populate({
                                path : 'user',
                                select: 'firstName lastName email image'
                            })
                            .populate({
                                path : 'course',
                                select : 'courseName'
                            })
                            .exec();

        return res.status(200).json({
            success : true,
            data : allRatings,
            message : 'All ratings fetched successfully'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while fetching ratings',
            error : error.message
        })
    }
}