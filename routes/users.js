var express = require("express");
var router = express.Router();

//register function
router.post("/register", function (req, res, next) {
  if (req.body.email === "" || req.body.password === "") {
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
        //if the username already exists
        if (rows.length === 0) {
          req
            .db("users")
            .insert(req.body)
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

//login function
router.post("/login", function (req, res, next) {
  if (req.body.email === "" || req.body.password === "") {
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
        //if the username already exists
        if (rows.length === 0 || req.body.password !== rows[0].password) {
          res.status(401).json({
            error: true,
            message: "Incorrect email or password",
          });
        } else {
          res.status(200).json({
            token: "afakejsonwebtoken",
            token_type: "Bearer",
            expires: 86400,
          });
        }
      });
  }
});

module.exports = router;
