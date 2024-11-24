module.exports = router;
var express = require('express');
var router = express.Router();


// GET /reservations
router.get("/", (req, res, next) => {
    res.render("reservations", { title: "Add a new reservation", user: req.user });
});

module.exports = router;