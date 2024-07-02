const express = require('express');
const router = express.Router();

const {
    capturePayment,
    verifySignature
} = require('../controller/Payments');

const {auth , isStudent } = require('../middlewares/auth');

router.post('/capturePayment' , auth , isStudent , capturePayment);
router.post('/verifyPayment' , auth , isStudent , verifySignature);

module.exports = router;