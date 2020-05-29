var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");

const secretKey = "secret key";

const getAllStocks = (req, res) => {
  req.db
    .from("stocks")
    .select("name", "symbol", "industry")
    .distinct()
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      res.json({ Error: true, Message: "hello" });
    });
};

const getStocksByIndustry = (req, res) => {
  req.query.industry
    ? req.db
        .from("stocks")
        .select("name", "symbol", "industry")
        .where("industry", "like", "%" + req.query.industry + "%")
        .distinct()
        .then((rows) => {
          rows.length === 0
            ? res.status(404).json({
                error: true,
                message: "Industry sector not found",
              })
            : res.status(200).json(rows);
        })
        .catch((err) => {
          res.json({ Error: true, Message: "hell2" });
        })
    : res.status(400).json({
        error: true,
        message: "Invalid query parameter: only 'industry' is permitted",
      });
};

const getStockBySymbol = (req, res) => {
  if (Object.keys(req.query).length === 0) {
    req.db
      .from("stocks")
      .select("*")
      .where("symbol", "=", req.params.symbol)
      .then((rows) => {
        rows.length === 0
          ? res.status(404).json({
              error: true,
              message: "No entry for symbol in stocks database",
            })
          : res.status(200).json(rows[0]);
      });
  } else {
    res.status(400).json({
      error: true,
      message:
        "Date parameters only available on authenticated route /stocks/authed",
    });
  }
};

const getAuthedStockDetails = (req, res) => {
  req.db
    .from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .then((rows) => {
      rows.length === 0
        ? res.status(404).json({
            error: true,
            message:
              "No entries available for query symbol for supplied date range",
          })
        : res.status(200).json(rows);
    });
};

const getAuthedStockWithDate = (req, res) => {
  if (req.query.from && req.query.to && Object.keys(req.query).length === 2) {
    req.db
      .from("stocks")
      .select("*")
      .where("symbol", "=", req.params.symbol)
      .where("timestamp", ">", req.query.from)
      .where("timestamp", "<=", req.query.to)
      .then((rows) => {
        rows.length === 0
          ? res.status(404).json({
              error: true,
              message:
                "No entries available for query symbol for supplied date range",
            })
          : res.status(200).json(rows);
      });
  } else {
    res.status(400).json({
      error: true,
      message:
        "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15",
    });
  }
};

const getStockDetails = (req, res) => {
  const authorization = req.headers.authorization;
  let token = null;
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  } else {
    res.status(403).json({
      error: true,
      message: "Authorization header not found",
    });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    //if the token has expired
    if (decoded.exp > Date.now()) {
      res.status(403).json({
        error: true,
        message: "Authorization header not found",
      });
      //jwt is accepted
    } else {
      if (Object.keys(req.query).length === 0) {
        getAuthedStockDetails(req, res);
      } else {
        getAuthedStockWithDate(req, res);
      }
    }
  } catch (e) {
    //the token is not valid
  }
};

router.get("/symbols", function (req, res) {
  //if the query has no parameter passed in
  if (Object.keys(req.query).length === 0) {
    getAllStocks(req, res);
  } else {
    getStocksByIndustry(req, res);
  }
});

router.get("/:symbol", function (req, res) {
  getStockBySymbol(req, res);
});

router.get("/authed/:symbol", function (req, res) {
  getStockDetails(req, res);
});

module.exports = router;
