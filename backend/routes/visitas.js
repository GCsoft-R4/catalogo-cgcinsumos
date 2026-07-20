const router = require('express').Router();
const { registrarVisita, listarVisitas, deleteVisita, clearLocales } = require('../controllers/visitasController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/visitas', registrarVisita);
router.get('/visitas', authMiddleware, listarVisitas);
router.delete('/visitas/:id', authMiddleware, deleteVisita);
router.post('/visitas/clear-locales', authMiddleware, clearLocales);

module.exports = router;
