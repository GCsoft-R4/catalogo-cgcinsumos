const { Router } = require('express');
const { forgotPassword, resetPassword } = require('../controllers/resetController');

const router = Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
