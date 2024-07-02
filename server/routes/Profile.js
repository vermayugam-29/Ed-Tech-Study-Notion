const express = require('express');
const router = express.Router();

const {
    updateProfile,
    deleteAccount,
    getUserDetails,
    updateProfilePicture
} = require('../controller/Profile');

const {auth } = require('../middlewares/auth');

router.post('/updateProfile' , auth , updateProfile);
router.delete('/deleteAccount' , auth , deleteAccount);
router.get('/getUserDetails' , auth , getUserDetails);
router.put('/updateDisplayPicture' , auth , updateProfilePicture);

module.exports = router;