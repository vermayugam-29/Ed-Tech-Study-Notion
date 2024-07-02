const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');
const { uploadToCloudinary } = require('../utils/imageUploader');

exports.updateProfile = async(req , res) => {
    try {
        const {
            dateOfBirth = '' , 
            about = '',
            contactNumber = '', 
            gender = ''
        }
        = req.body;

        const id = req.user.id;


        const user = await User.findById({_id : id});
        const profileId = user.additionalDetails;

        const profileDetails = await Profile.findById({_id : profileId});

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        profileDetails.save();

        res.status(200).json({
            success : true,
            message : 'Profile updated successfully',
            data : profileDetails
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while updating profile , please try again later',
            error : error.message
        })
    }
}

//how can we schedule account deletion 
//cronJob
exports.deleteAccount = async(req , res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({
                success : false,
                message : 'User not found'
            })
        }
        await Profile.findByIdAndDelete({_id : user.additionalDetails});

        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(
                {_id : courseId},
                {$pull : {studentsEnrolled : id}},
                {new : true}
            );
        }

        await User.findByIdAndDelete({_id : id});

        res.status(200).json({
            success: true,
            message : 'Account Deleted Sucssfully',
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while deleting your account , please try again later',
            error : error.message
        })
    }
} 

exports.getUserDetails = async(req , res) => {
    try {
        const id = req.user.id;

        const user = await User.findById(id).populate('additionalDetails').exec();

        res.status(200).json({
            success : true,
            message : 'User data fetched successfully',
            data : user
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while getting user details , please try again later',
            error : error.message
        })
    }
}

exports.updateProfilePicture = async(req , res) => {
    try {
        const profilePic = req.files.displayPicture;
        const userId = req.user.id;

        const imageUpload = await uploadToCloudinary(
            profilePic,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        const profileUpdate = await User.findByIdAndUpdate(
            {_id : userId} ,
            {image : imageUpload.secure_url},
            {new : true}
        );

        return res.status(200).json({
            success : true,
            message : 'Profile Picture updated Successfully',
            data : profileUpdate
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : 'Something went wrong while updating profile picture',
            error : error.message
        })
    }
}