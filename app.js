require("dotenv").config();
const { errors } = require("celebrate");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const auth = require("./middlewares/auth");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3000, DB_ADDRESS = "mongodb://127.0.0.1/moviesdb" } =
  process.env;
mongoose.set("strictQuery", false);
const app = express();

app.options("*", cors());
app.use(cors());

app.use(helmet());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Подключение к серверу mongo
mongoose.connect(DB_ADDRESS);

// Подключение логгера запросов
app.use(requestLogger);

// Регистрация и логин
app.use(require("./routes/signup"));
app.use(require("./routes/signin"));

// Авторизация
app.use(auth);

app.use(require("./routes/users"));
app.use(require("./routes/results"));

// Роут неизвестного маршрута
app.use("*", require("./routes/notExisted"));

// Подключение логгера ошибок
app.use(errorLogger);

app.use(errors());

app.use(require("./middlewares/error"));

app.listen(PORT);
