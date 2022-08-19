const express = require("express");
const router = express.Router();
const users = require("../data/users");
const movies = require("../data/movies");

router.post('/:id', async (req, res) => {
    if (req.session && req.session.user && req.session.user.id) {
        const user = await users.getUserById(req.session.user.id);
        let movieIds = [];
        pushToArray(movieIds, user.watch_list);
        pushToArray(movieIds, user.preferences.liked_movies);
        pushToArray(movieIds, user.preferences.disliked_movies);
    
        const moviesResult = await movies.getMoviesById(movieIds);
        let moviesResultMap = {};
        moviesResult.forEach((movie) => {
          moviesResultMap[movie._id.toString()] = movie;
        });
    
        let watchList = [];
        user.watch_list.map((movie) => {
          watchList.push(moviesResultMap[movie]);
        });

        res.render("users/profile", {
            title: "Watchlist",
            username: user.username,
            preferences: user.preferences,
            watchList: watchList,
          });





    }
    else {
        res.status(403).render("../views/users/signup", {
          message: "You need to be signed up to access this page",
        });
        return;
      }
    // if (req.session.user) {
    //     res.render('movies/watchlist', {
    //         title: "watchlist"
    //     });
    // } else {
    //     res.redirect('/');
    // }
});

// module.exports = router;

// // Updated From Here
// const express = require('express');
// const router = express.Router();
// const movies = require("../data/watchlist");
// var xss = require("xss");

// router.post('/', async (req, res) => {
   
// });

function pushToArray(targetArray, inputArray) {
    if (inputArray) {
      inputArray.forEach((input) => targetArray.push(input));
    }
  }
module.exports = router;