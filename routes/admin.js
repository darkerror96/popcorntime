const express = require("express");
const router = express.Router();
const movies = require("../data/movies");

router.get("/", async (req, res) => {
  res.render("users/admin", { title: "Admin" });
});

router.post("/", async (req, res) => {
  const option = req.body.admin_radio;
  if (option === "edit" || option === "delete") {
    res.redirect("/search");
  } else if (option === "add") {
    res.redirect("/admin/add");
  }
});

router.get("/add", async (req, res) => {
  res.render("movies/add_movie", { title: "Add Movie" });
});

router.post("/add", async (req, res) => {
  const name = req.body.movie_name;
  const summary = req.body.summary;
  const genres = req.body.genres;
  const duration = req.body.duration;
  const poster = req.body.poster;
  const release_date = req.body.release_date;
  const cast = req.body.cast;
  const director = req.body.director;

  const newMovie = {
    name: name,
    summary: summary,
    genres: genres,
    duration: duration,
    poster: poster,
    release_date: release_date,
    cast: cast,
    director: director,
  };

  const newMovieId = await movies.addMovie(newMovie);
  if (newMovieId) {
    res.redirect("/admin");
  } else {
    res.redirect("/admin/add");
  }
});
module.exports = router;
