const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
require('dotenv').config();

//send otp
exports.sendOTP = async(req , res) => {
    try {
        const { email } = req.body;

        //check if email is not sent
        if(!email) {
            return res.status(403).json({
                success : false,
                message : 'Please provide with an email to get otp'
            })
        }

        //check if user already exists
        const checkUserPresent = await User.findOne({email});
        if(checkUserPresent) {
            return res.status(401).json({
                success : false,
                message : 'User already registered'
            })
        }

        //generate otp
        let otp = otpGenerator.generate(6 , {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false
        });

        //check if otp is unique
        let result = await OTP.findOne({otp : otp});

        while(result){
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            });
        }

        const otpGenerated = await OTP.create({email , otp});

        res.status(200).json({
            success : true,
            message : 'Otp sent successfully',
            data : otp
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            error : error.message , 
            message : 'Something went wrong while sending otp'
        })
    }
}

//sign up
exports.signUp = async(req , res) => {
    try {
        const {
            firstName , 
            lastName , 
            email , 
            contactNumber ,
            password , 
            confirmPassword , 
            accountType , 
            otp
        } = req.body;

        if(!firstName || !email || !password || !confirmPassword || !otp){
            return res.status(200).json({
                success : false,
                message : 'Please provide all the details to register'
            })
        }

        //check passwords
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : 'Both the passwords should be same'
            })
        }

        //check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : 'User already registered , Please use any other email'
            })
        }

        //fet the recent otp for email that we got from request body
        const recentOtp = await OTP.find({email}).sort({createdAt : -1}).limit(1);
        if(recentOtp.length === 0){
            return res.status(400).json({
                success : false,
                message : 'Otp not found'
            })
        }
        if(recentOtp[0].otp !== otp){
            return res.status(400).json({
                success : false,
                message : 'OTP is not valid'
            })
        }
        const hashedPassword = await bcrypt.hash(password , 10);

        const profile = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : contactNumber ? contactNumber : null
        })

        const charsOfName = firstName.charAt(0) + (lastName ? lastName.charAt(0) : '');

        const user = await User.create({
            firstName , 
            lastName : lastName ? lastName : null , 
            email  ,
            password : hashedPassword ,
            accountType,
            additionalDetails : profile._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${charsOfName}`,
        })

        res.status(200).json({
            success : true,
            message : 'Account created Successfully',
            data : user
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            error : error.message,
            message : 'Something went wrong while creating account , Please try again later'
        })
    }
}

//log in
exports.logIn = async(req , res) => {
    try {
        const {email , password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success : false,
                message : 'Please fill all the fields to log in'
            })
        }

        const findUser = await User.findOne({email});
        if(!findUser) {
            return res.status(401).json({
                succcess : false,
                message : 'User not regiistered yet , Please Sign up  first'
            })
        }


        if(await bcrypt.compare(password , findUser.password )){
            const payload = {
                email : findUser.email,
                id : findUser._id,
                accountType : findUser.accountType
            }
            const token = jwt.sign(payload , process.env.JWT_SECRET ,{
                expiresIn : '3h'
            })
            findUser.token = token;
            findUser.password = undefined;

            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true
            }

            return res.cookie('token' , token , options).status(200).json({
                success : true,
                token : token,
                data : findUser,
                message : 'Logged In Successfully'
            })
        }

        res.status(401).json({
            success : false,
            message : 'Password is incorrect'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            error : error.message,
            message : 'Failed to log in , Please try again after some time'
        })
    }
} 

//change password
exports.changePassword = async(req , res) => {
    try {
        const {email , oldPass , newPass , cnfrmNewPass} = req.body;
        if(!email || !oldPass || !newPass || !cnfrmNewPass){
            return res.status(403).json({
                success : false,
                message : 'Please provide with all the details to change password'
            })
        }

        //validation
        if(newPass !== cnfrmNewPass){
            return res.status(400).json({
                success : false,
                message : 'New Passsword and Confirm password should be same'
            })
        }

        let user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({
                success : false,
                message : 'No such user found please sign up first'
            })
        }

        if(await bcrypt.compare(oldPass , user.password)){
            const hashedPassword  = await bcrypt.hash(newPass , 10);
            user = await  User.findOneAndUpdate(
                {email : email},
                {password : hashedPassword},
                {new : true}
            );

            //send mail
            try {
                const emailResponse = await mailSender(
                    user.email ,
                    'Password for your account has been updated',
                    passwordUpdated(
                        user.email,
                        `${user.firstName} ${user.lastName ? user.lastName : ''}`
                    )
                )
            } catch (error) {
                return res.status(500).json({
                    success : false,
                    message : 'Something went wrong while sending mail',
                    error : error.message
                })
            }
            
            return res.status(200).json({
                success : true,
                message : 'Password udated successfully',
                data : user
            })
        }

        res.status(401).json({
            success : false,
            message : 'Old password was incorrect , Please Provide correct password to change'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while changing the password',
            error : error.message
        })
    }
}