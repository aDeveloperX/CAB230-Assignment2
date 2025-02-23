var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUI = require("swagger-ui-express");
const helmet = require("helmet");
var cors = require("cors");

yaml = require("yamljs");
swaggerDocument = yaml.load("./docs/swagger.yaml");

const options = require("./knexfile");
const knex = require("knex")(options);

//var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var stockRouter = require("./routes/stocks");

//const swaggerUI = require("swagger-ui-express");
//const swaggerDocument = require("./docs/swaggerpet.json");

var app = express();
app.use(helmet());
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use("/user", usersRouter);
app.use("/stocks", stockRouter);
app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//app.use("/", indexRouter);

// catch 404 and forward to error handler

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
