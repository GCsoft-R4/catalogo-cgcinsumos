const { Router } = require('express');
const { getAll, create, update, remove } = require('../controllers/usuarioController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/usuarios', authMiddleware, getAll);
router.post('/usuarios', authMiddleware, create);
router.put('/usuarios/:id', authMiddleware, update);
router.delete('/usuarios/:id', authMiddleware, remove);

module.exports = router;
