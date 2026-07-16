const { Router } = require('express');
const { login } = require('../controllers/authController');
const { loginRules, validate } = require('../middlewares/validation');

const router = Router();

router.post('/login', loginRules, validate, login);

module.exports = router;
