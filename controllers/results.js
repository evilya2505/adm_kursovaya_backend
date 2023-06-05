const Result = require("../models/results");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

const getResults = (req, res, next) => {
  Result.find({})
    .populate("owner")
    .then((results) => res.send({ data: results }))
    .catch(next);
};

const postResult = (req, res, next) => {
  const { firstText, secondText, levenshteinDistance } = req.body;
  const { _id } = req.user;

  Result.create({
    firstText,
    secondText,
    levenshteinDistance,
    owner: _id,
  })
    .then((result) => res.send({ data: result }))
    .catch((err) => {
      if (err.name === "CastError" || err.name === "ValidationError") {
        throw new BadRequestError("Переданы неккоректные данные.");
      } else {
        throw new Error("Ошибка. Что-то пошло не так.");
      }
    })
    .catch(next);
};

const deleteResult = (req, res, next) => {
  const { _id } = req.user;

  Result.findById(req.params.resultId)
    .orFail(new NotFoundError("Результат с данным id не найден."))
    .then((result) => {
      if (result.owner.toString() !== _id) {
        throw new ForbiddenError("Нет прав для удаления результата.");
      }

      return Result.findByIdAndDelete(req.params.resultId).then((data) => {
        res.send({ data });
      });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        throw new BadRequestError("Переданы некорректные данные.");
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports = {
  getResults,
  postResult,
  deleteResult,
};
