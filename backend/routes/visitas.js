const router = require('express').Router();
const { registrarVisita, listarVisitas, deleteVisita, clearVisitas } = require('../controllers/visitasController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/visitas', registrarVisita);
router.get('/visitas', authMiddleware, listarVisitas);
router.delete('/visitas/:id', authMiddleware, deleteVisita);
router.delete('/visitas', authMiddleware, clearVisitas);

module.exports = router;
