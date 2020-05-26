var express = require("express");
var router = express.Router();

/* GET home page. */

router.get("/symbols", function (req, res, next) {
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
});

router.get("/:symbol", function (req, res, next) {
  req.db
    .from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .then((rows) => {
      res.json(rows[0]);
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "hell2" });
    });
});

module.exports = router;
