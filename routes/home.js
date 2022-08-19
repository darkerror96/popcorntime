const express = require("express");
const router = express.Router();
const users = require("../data/users");
const movies = require("../data/movies");

router.get("/", async (req, res) => {

  try {
    if (req.session && req.session.user && req.session.user.id) {
      const user = await users.getUserById(req.session.user.id);

      let likedActors = [];
      const liked_actors = user.preferences.liked_actors;
      if (liked_actors.length > 0) {
        for (var i = 0; i < liked_actors.length; i++) {
          let temp = await movies.fetchCast(liked_actors[i]);
          pushToArray(likedActors, temp);
        }
        if (likedActors.length > 5) {
          likedActors = getRandom(likedActors, 5);
        }
      } else {
        const allMovies = await movies.getAllMovies();
        likedActors = allMovies
          .sort((a, b) => {
            if (a.avg_rating === b.avg_rating) {
              return b.reviews.length - a.reviews.length;
            }
            return b.avg_rating - a.avg_rating;
          })
          .slice(0, 100);
        likedActors = getRandom(likedActors, 5);
      }

      let likedDirectors = [];
      const liked_directors = user.preferences.liked_directors;
      if (liked_directors.length > 0) {
        for (var i = 0; i < liked_directors.length; i++) {
          let temp = await movies.fetchDirector(liked_directors[i]);
          pushToArray(likedDirectors, temp);
        }
        if (likedDirectors.length > 5) {
          likedDirectors = getRandom(likedDirectors, 5);
        }
      } else {
        const allMovies = await movies.getAllMovies();
        likedDirectors = allMovies
          .sort((a, b) => {
            if (a.avg_rating === b.avg_rating) {
              return b.reviews.length - a.reviews.length;
            }
            return b.avg_rating - a.avg_rating;
          })
          .slice(0, 100);
        likedDirectors = getRandom(likedDirectors, 5);
      }

      let likedGenres = [];
      const liked_genres = user.preferences.liked_genres;
      if (liked_genres.length > 0) {
        for (var i = 0; i < liked_genres.length; i++) {
          let temp = await movies.fetchGenre(liked_genres[i]);
          pushToArray(likedGenres, temp);
        }
        if (likedGenres.length > 5) {
          likedGenres = getRandom(likedGenres, 5);
        }
      } else {
        const allMovies = await movies.getAllMovies();
        likedGenres = allMovies
          .sort((a, b) => {
            if (a.avg_rating === b.avg_rating) {
              return b.reviews.length - a.reviews.length;
            }
            return b.avg_rating - a.avg_rating;
          })
          .slice(0, 100);
        likedGenres = getRandom(likedGenres, 5);
      }

      res.render("movies/homePage", {
        title: "Flick Finder",
        actorHeading: "By Preferred Actor:",
        actor: likedActors,
        directorHeading: "By Preferred Director:",
        director: likedDirectors,
        genreHeading: "By Preferred Genre:",
        genre: likedGenres,
      });
    } else {
      let randomRecommendation = [];
      let likedActors, likedDirectors, likedGenres = [];
      const allMovies = await movies.getAllMovies();
      randomRecommendation = allMovies
        .sort((a, b) => {
          if (a.avg_rating === b.avg_rating) {
            return b.reviews.length - a.reviews.length;
          }
          return b.avg_rating - a.avg_rating;
        })
        .slice(0, 100);
      likedActors = getRandom(randomRecommendation, 5);
      likedDirectors = getRandom(randomRecommendation, 5);
      likedGenres = getRandom(randomRecommendation, 5);
      res.render("movies/homePage", {
        title: "Flick Finder",
        actorHeading: "By Preferred Actor:",
        actor: likedActors,
        directorHeading: "By Preferred Director:",
        director: likedDirectors,
        genreHeading: "By Preferred Genre:",
        genre: likedGenres,
      });
    }
    

  } catch (e) {
    res.status(500).render("movies/error", {
      title: "No Movies Found",
      hasErrors: true,
      error: e,
    });
  }
});

function pushToArray(targetArray, inputArray) {
  if (inputArray) {
    inputArray.forEach((input) => targetArray.push(input));
  }
}

function getRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

module.exports = router;