const { Router } = require('express');
const { getAll, create, update, remove } = require('../controllers/categoriaController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/categorias', getAll);
router.post('/categorias', authMiddleware, create);
router.put('/categorias/:id', authMiddleware, update);
router.delete('/categorias/:id', authMiddleware, remove);

module.exports = router;
