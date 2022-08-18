const express = require("express");
const router = express.Router();
const movies = require("../data/movies");

router.get("/", async (req, res) => {
  const allMovies = await movies.getAllMovies();
  const topTen = allMovies
    .sort((a, b) => {
      if (a.avg_rating === b.avg_rating) {
        return b.reviews.length - a.reviews.length;
      }
      return b.avg_rating - a.avg_rating;
    })
    .slice(0, 10);
  res.render("movies/hall_of_fame", {
    title: "Hall of Fame",
    movies: topTen,
  });
});

module.exports = router;