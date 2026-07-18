const { Router } = require('express');
const {
  getAll, getById, create, update, remove, uploadImage
} = require('../controllers/productoController');
const { listImages, uploadMultiple, deleteImage } = require('../controllers/uploadController');
const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { productoRules, validate } = require('../middlewares/validation');

const router = Router();

router.get('/productos', getAll);
router.get('/productos/:id', getById);

router.post('/productos', authMiddleware, upload.single('imagen'), productoRules, validate, create);
router.put('/productos/:id', authMiddleware, upload.single('imagen'), productoRules, validate, update);
router.delete('/productos/:id', authMiddleware, remove);
router.post('/upload', authMiddleware, upload.single('imagen'), uploadImage);

router.get('/uploads', authMiddleware, listImages);
router.post('/upload/multiple', authMiddleware, upload.array('imagenes', 20), uploadMultiple);
router.delete('/uploads/:filename', authMiddleware, deleteImage);

module.exports = router;
