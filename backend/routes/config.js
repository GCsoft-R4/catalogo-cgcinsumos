const router = require('express').Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/config', getConfig);
router.put('/config', authMiddleware, updateConfig);

module.exports = router;
