var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const secretKey = "secret key";
//register function
router.post("/register", function (req, res, next) {
  if (
    !req.body.email ||
    !req.body.password ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
  } else {
    req.db
      .from("users")
      .select("*")
      .where("email", "=", req.body.email)
      .then((rows) => {
        //if the username doesn't exists
        if (rows.length === 0) {
          const saltRounds = 10;
          const hash = bcrypt.hashSync(req.body.password, saltRounds);
          console.log(hash);
          req
            .db("users")
            .insert({ email: req.body.email, hash: hash })
            .then(
              res.status(201).json({
                success: true,
                message: "User created",
              })
            );
        } else {
          res.status(409).json({
            error: true,
            message: "User already exists!",
          });
        }
      });
  }
});

const generateJWT = (email) => {
  const expires_in = 60 * 60 * 24;
  const exp = Math.floor(Date.now() / 1000) + expires_in;
  const token = jwt.sign({ email, exp }, secretKey);
  return { token: token, expires_in: expires_in };
};

//login function
router.post("/login", function (req, res, next) {
  if (
    !req.body.email ||
    !req.body.password ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    res.status(400).json({
      error: true,
      message: "Request body invalid - email and password are required",
    });
  } else {
    req.db
      .from("users")
      .select("*")
      .where("email", "=", req.body.email)
      .then((rows) => {
        //if the username exists
        if (rows.length !== 0) {
          bcrypt.compare(req.body.password, rows[0].hash, function (
            err,
            response
          ) {
            if (response) {
              const jwtObj = generateJWT(req.body.email);
              res.status(200).json({
                token_type: "Bearer",
                token: jwtObj.token,
                expires_in: jwtObj.expires_in,
              });
            } else {
              res.status(401).json({
                error: true,
                message: "Incorrect email or password",
              });
            }
          });
        } else {
          res.status(401).json({
            error: true,
            message: "Incorrect email or password",
          });
        }
      });
  }
});

module.exports = router;
