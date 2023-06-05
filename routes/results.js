const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const {
  getResults,
  postResult,
  deleteResult,
} = require("../controllers/results");

router.get("/results", getResults);
router.post(
  "/results",
  celebrate({
    body: Joi.object().keys({
      firstText: Joi.string().required(),
      secondText: Joi.string().required(),
      levenshteinDistance: Joi.number().required(),
    }),
  }),
  postResult
);
router.delete(
  "/results/:resultId",
  celebrate({
    params: Joi.object().keys({
      resultId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteResult
);

module.exports = router;
