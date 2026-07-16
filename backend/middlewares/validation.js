const { body, validationResult } = require('express-validator');

const productoRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres')
    .escape(),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
    .escape(),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0')
];

const loginRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('El usuario es obligatorio')
    .escape(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
}

module.exports = { productoRules, loginRules, validate };
