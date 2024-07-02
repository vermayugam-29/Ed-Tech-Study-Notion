const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

//auth
exports.auth = async(req ,res ,next) => {
    try {
        //extract token
        const token = req.cookies.token
                    || req.body.token
                    || req.header('Authorization').replace('Bearer ' , '');

        if(!token){
            return res.status(401).json({
                success :false,
                message : 'Token is missing'
            })
        }

        //verify the token
        try {
            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success : false,
                message : 'Token is invalid'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : 'Something went wrong while validating the token',
            error : error.message
        })
    }
}

//student
exports.isStudent = async(req , res, next) => {
    try {
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for Students only'
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Somehting went wrong while validating role',
            error : error.message
        })
    }
}

//instructor
exports.isInstructor = async(req , res, next) => {
    try {
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for Instructor only'
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Somehting went wrong while validating role',
            error : error.message
        })
    }
}

//admin
exports.isAdmin = async(req , res, next) => {
    try {
        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for Admins'
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Somehting went wrong while validating role',
            error : error.message
        })
    }
}