const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/imageUploader');

//create course
exports.createCourse = async(req ,res) => {
    try {
        const {
            courseName , 
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            tags
        } = req.body;

        const thumbnail = req.files.thumbnailImage;


        if(!courseName || !courseDescription || !whatYouWillLearn || 
            !price || !category || !thumbnail )
        {
           return res.status(400).json({
            success : false,
            message : 'All fields are required'
           });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById({_id : userId});

        if(!instructorDetails){
            return res.status(404).json({
                success : false,
                message : 'Instructor details not found'
            });
        }

        const categoryDetails = Category.findById({_id : category});
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message : 'Category Details not found'
            })
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadToCloudinary(thumbnail , process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName , courseDescription ,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price, category,tags,
            thumbnail : thumbnail.secure_url
        })

        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            {$push : {courses : newCourse._id}},
            {new : true}
        );

        await Category.findByIdAndUpdate(
            {_id : category},
            {$push : {courses : newCourse._id}},
            {new : true}
        );

        res.status(200).json({
            success : true,
            message : 'Course created Successfully',
            data : newCourse
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while creating course please try again later',
            error : error.message
        })   
    }
}

//get all course
exports.getAllCourses = async(req , res) => {
    try {
        const allCourses = await Course.find({} , {
            courseName : true,
            price : true,
            thumbnail : true,
            instructor : true,
            ratingAndReviews : true,
            studentsEnrolled : true
        }).populate('instructor').exec();

        res.status(200).json({
            success : true,
            message : 'All Courses fetched succesfully',
            data : allCourses
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while fetching courses',
            error : error.message
        })
    }
}

//get single courseDetails
exports.getCourseDetails = async(req , res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId)
                            .populate({
                                path : 'instructor',
                                populate : {
                                    path : 'additionalDetails'
                                }
                            })
                            .populate('category')
                            .populate('ratingAndReviews')
                            .populate({
                                path : 'courseContent',
                                populate : {
                                    path : 'subSection'
                                }
                            })
                            .exec();

        if (!course) {
            return res.status(400).json({
                success : false,
                message : `Couldn't find the course with ${courseId}`
            })
        }
        
        return res.status(200).json({
            success : true,
            message : 'Course details fetched successfully',
            data : course
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while fetching course details',
            error : error.message
        })
    }
}
