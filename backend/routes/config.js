const router = require('express').Router();
const { getConfig, updateConfig, uploadLogo, deleteLogo } = require('../controllers/configController');
const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.get('/config', getConfig);
router.put('/config', authMiddleware, updateConfig);
router.post('/config/logo', authMiddleware, upload.single('logo'), uploadLogo);
router.delete('/config/logo', authMiddleware, deleteLogo);

module.exports = router;
