const router = require('express').Router();
const { getConfig, updateConfig, uploadLogo } = require('../controllers/configController');
const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.get('/config', getConfig);
router.put('/config', authMiddleware, updateConfig);
router.post('/config/logo', authMiddleware, upload.single('logo'), uploadLogo);

module.exports = router;
