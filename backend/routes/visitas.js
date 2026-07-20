const router = require('express').Router();
const { registrarVisita, listarVisitas } = require('../controllers/visitasController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/visitas', registrarVisita);
router.get('/visitas', authMiddleware, listarVisitas);

module.exports = router;
