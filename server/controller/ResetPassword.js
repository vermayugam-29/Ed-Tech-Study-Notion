const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');


//reset password token
exports.resetPasswordToken = async(req , res) => { 
    try {
        const email = req.body.email;

        let user = await User.findOne({email});
        if(!email){
            return res.status(403).json({
                success : false,
                message : 'User not registered yet'
            })
        }

        const token = crypto.randomUUID();

        user = await User.findOneAndUpdate(
            {email : email} ,
            {token : token , resetPasswordExpires : Date.now() + 5*60*1000},
            {new : true}
        );

        const name = (user.firstName + (user.lastName ? user.lastName : '')).toLowerCase() ;

        const url = `http://localhost:3000/${name}/reset-password/${token}`

        await mailSender(email , 'Password reset link' ,
                `Password reset link : ${url}`,
        )

        res.status(200).json({
            success : true,
            message : 'Email sent successfully , pease check email and reset password'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while resetting password',
            error : error.message
        })
    }
}

//reset password
exports.resetPassword = async(req , res) => {
    try {
        //fetch data
        const {password , cnfrmPassword , token} = req.body;
        //validation
        if(password != cnfrmPassword){
            return res.status(401).json({
                success :false,
                message : 'Both the passwords should  be same'
            })
        }
        //get userdetails from database
        const user = await User.findOne({token : token});
        //check if token is present
        if(!user){
            return res.status(400).json({
                success : false,
                message : 'Invalid token'
            })
        }
        //check token expiration
        if(user.resetPasswordExpires < Date.now()){
            return res.status(400).json({
                success : false, 
                message : 'Link Exired please try again later'
            })
        }
        //hash passord
        const hashedPassword = await bcrypt.hash(password , 10);
        //update password
        const userUpdate = await User.findOneAndUpdate(
            {token : token} ,
            {password : hashedPassword , token : ''},
            {new : true}
        )

        res.status(200).json({
            success : true,
            data : userUpdate,
            token : token,
            message : 'Password reset successfull'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong  while resetting password'
        })
    }
}