const express = require("express");
const router = express.Router();
const users = require("../data/users");
const movies = require("../data/movies");

router.get("/", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  req.session = {};
  req.session.user = "john_doe";
  if (true || (req.session && req.session.user)) {
    const user = await users.getUsername(req.session.user);
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
    let likedMovies = [];
    user.preferences.liked_movies.map((movie) => {
      likedMovies.push(moviesResultMap[movie]);
    });
    let dislikedMovies = [];
    user.preferences.disliked_movies.map((movie) => {
      dislikedMovies.push(moviesResultMap[movie]);
    });

    res.render("users/profile", {
      title: "Profile",
      first_name: user.first_name,
      preferences: user.preferences,
      watchList: watchList,
      likedMovies: likedMovies,
      dislikedMovies: dislikedMovies,
    });
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.post("/watchlist/:id", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  req.session = {};
  req.session.user = "john_doe";
  req.session.user_id = "62edec84bcd3a79c27abaa0c";
  if (true || (req.session && req.session.user)) {
    try {
      let movieId = req.params.id;
      movieId = validation.checkId(movieId, "Id url param");

      const user = await users.getUserById(req.session.user_id);
      const index = user.watch_list.findIndex(
        (watchListMovieId) => movieId === watchListMovieId
      );
      if (index === -1) {
        user.watch_list.push(movieId);
        users.addToWatchList(movieId);
      } else {
        res.status(304).send();
      }
      return;
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

function pushToArray(targetArray, inputArray) {
  if (inputArray) {
    inputArray.forEach((input) => targetArray.push(input));
  }
}

module.exports = router;
