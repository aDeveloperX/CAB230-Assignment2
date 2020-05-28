var express = require("express");
var router = express.Router();

/* GET home page. */

router.get("/symbols", function (req, res, next) {
  //if the query has no parameter passed in
  if (Object.keys(req.query).length === 0) {
    req.db
      .from("stocks")
      .select("name", "symbol", "industry")
      .distinct()
      .then((rows) => {
        res.json(rows);
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "hello" });
      });
  } else {
    req.query.industry
      ? req.db
          .from("stocks")
          .select("name", "symbol", "industry")
          .where("industry", "like", req.query.industry.substring(0, 5) + "%")
          .distinct()
          .then((rows) => {
            rows.length === 0
              ? res.json({
                  error: true,
                  message: "Industry sector not found",
                })
              : res.json(rows);
          })
          .catch((err) => {
            console.log(err);
            res.json({ Error: true, Message: "hell2" });
          })
      : res.json({
          error: true,
          message: "Invalid query parameter: only 'industry' is permitted",
        });
  }
});

router.get("/:symbol", function (req, res, next) {
  req.db
    .from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .then((rows) => {
      rows.length === 0
        ? res.json({
            error: true,
            message: "No entry for symbol in stocks database",
          })
        : res.json(rows[0]);
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "hell2" });
    });
});

module.exports = router;
