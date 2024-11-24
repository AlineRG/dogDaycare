var express = require('express');
var router = express.Router();


// GET /pets
router.get("/pets", AuthenticationMiddleware, (req, res, next) => {
    res.render("pets", { title: "Add a new pet" , user: req.user });
  });

module.exports = router;