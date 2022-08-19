const express = require("express");
const router = express.Router();

router.get('/', async (req, res) => {
    if (req.session.user) {
        res.render('movies/watchlist', {
            title: "watchlist"
        });
    } else {
        res.redirect('/');
    }
});

// module.exports = router;

// // Updated From Here
// const express = require('express');
// const router = express.Router();
// const movies = require("../data/watchlist");
// var xss = require("xss");

// router.post('/', async (req, res) => {
   
// });

module.exports = router;