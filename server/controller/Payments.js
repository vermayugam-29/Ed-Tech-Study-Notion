const { instance } = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const mongoose = require('mongoose');

//capture the payment and initiate raorpay order
exports.capturePayment = async (req, res) => {
    const { courseId } = req.body;
    const id = req.user.id;

    if (!courseId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide course id'
        })
    }

    let course
    try {
        course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Couldn't find course`
            })
        }

        const uid = new mongoose.Types.ObjectId(id);

        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: 'User has already purchased the course'
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while purchasing course , please try again later',
            error: error.message
        })
    }


    const amount = course.price;
    const currency = 'INR';

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course._id,
            userId : id
        }
    }

    try {
        const paymentResponse = await instance.orders.create(options);

        return res.status(200).json({
            success : true,
            courseName : course.courseName,
            description : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse._id,
            currency : paymentResponse.currency,
            amount : paymentResponse.amount,
            message : `Success purchasing the course`
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : `Couldn't initiate order`,
            error : error.message
        })
    }
}


exports.verifySignature = async(req , res) => {
    const webHookSecret = '12345678';

    const signatureFromRazorpay = req.headers['x-razorpay-signature'];

    const shaSum = crypto.createHmac('sha256' , webHookSecret);
    shaSum.update(JSON.stringify(req.body));

    const digest = shaSum.digest('hex');

    if(signatureFromRazorpay === digest){
        //payment is authorized
        const  {courseId , userId} = req.body.payload.payment.entity.notes;

        try {
            const enrolledCourse = await Course.findByIdAndUpdate(
                {_id : courseId} ,
                {$push : {studentsEnrolled : userId}},
                {new : true}
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success : false,
                    message : 'Course not found'
                })
            }

            const updatedUser = await User.findByIdAndUpdaye(
                {_id : userId},
                {$push : {courses : courseId }},
                {new : true}
            );

            //send mail
            mailSender(updatedUser.email , 'Course Purchase Success' , courseEnrollmentEmail);

            return res.status(200).json({
                success : true,
                message : 'Course purchased successfully',
                data : enrolledCourse
            })
        } catch (error) {
            return res.status(500).json({
                success : false,
                message : 'Somthing went wrong while payment , please try again later',
                error : error.message
            })
        }
    }

    else {
        return res.status(400).json({
            success : false,
            message : 'Invalid Request '
        })
    }
}