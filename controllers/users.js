const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");

// Возвращает информацию о пользователе (email и имя)
const getUserInfo = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new NotFoundError("Пользователь с таким id не найден."))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

// Обновляет информацию о пользователе (email и имя)
const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  const { _id } = req.user;

  User.findByIdAndUpdate(
    _id,
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new NotFoundError("Пользователь с таким id не найден"))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === "CastError" || err.name === "ValidationError") {
        throw new BadRequestError("Переданы неккоректные данные.");
      } else if (err.name === "MongoServerError" && err.code === 11000) {
        throw new ConflictError("Пользователь с таким email уже существует.");
      } else {
        next(err);
      }
    })
    .catch(next);
};

// Создать пользователя
const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
    )
    .then((user) => {
      const { name: userName, email: userEmail, _id: userID } = user;

      res.send({
        data: {
          name: userName,
          email: userEmail,
          _id: userID,
        },
      });
    })
    .catch((err) => {
      if (err.name === "CastError" || err.name === "ValidationError") {
        throw new BadRequestError(err.message);
      } else if (err.name === "MongoServerError" && err.code === 11000) {
        throw new ConflictError("Пользователь с таким email уже существует.");
      } else {
        throw new Error("Ошибка. Что-то пошло не так.");
      }
    })
    .catch(next);
};

// Контроллер получсет из запроса почту и пароль и проверяет их.
const login = (req, res, next) => {
  const { email, password } = req.body;
  let _id;

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Неправильная почта или пароль.");
      }

      _id = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new UnauthorizedError("Неправильная почта или пароль.");
      }

      const token = jwt.sign(
        { _id },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        { expiresIn: "7d" }
      );

      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getUserInfo,
  updateUserInfo,
};
