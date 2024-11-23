var express = require('express');
var router = express.Router();

// route.post('/pets')
// route.get('/pets')
// route.put('/pets')
// route.delete('/pets')

// GET /pets
router.get("/pets", AuthenticationMiddleware, (req, res, next) => {
    res.render("pets", { title: "Add a new pet" , user: req.user });
  });

module.exports = router;