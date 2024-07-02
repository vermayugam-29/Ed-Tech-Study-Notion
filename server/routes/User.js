const express = require("express")
const router = express.Router();


const {
    sendOTP,
    signUp,
    logIn,
    changePassword
} = require("../controller/Auth");

const {
    resetPasswordToken,
    resetPassword
} = require("../controller/ResetPassword");

const { auth } = require("../middlewares/auth");

router.post("/login", logIn);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/changepassword", auth, changePassword)

router.post("/reset-password-token", resetPasswordToken);
router.put("/reset-password", resetPassword);

module.exports = router;