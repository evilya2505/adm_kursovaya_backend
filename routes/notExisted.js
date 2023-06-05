const router = require('express').Router();
const NotFoundError = require('../errors/NotFoundError');

const notFoundError = new NotFoundError('Запрашиваемый ресурс не найден.');

router.all('*', () => {
  // Выбрасывает ошибку
  throw notFoundError;
});

module.exports = router;
