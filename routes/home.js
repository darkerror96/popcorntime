const express = require("express");
const router = express.Router();
const users = require("../data/users");
const movies = require("../data/movies");
const validation = require("../utils/validation");

router.get("/", async (req, res) => {
  var movieOption = ["Movie", "Cast", "Director", "Year"];

  try {
    if (req.session && req.session.user && req.session.user.id) {
      const user = await users.getUserById(req.session.user.id);

      let likedActors = [];
      const liked_actors = user.preferences.liked_actors;
      for (var i = 0; i < liked_actors.length; i++) {
        let temp = await movies.fetchCast(liked_actors[i]);

        pushToArray(likedActors, temp);
        console.log("Added " + likedActors.length);
        console.log(likedActors);
      }

      res.render("movies/homePage", {
        title: "loser",
        option: movieOption,
        preference: likedActors
      });
    } else {
      res.render("movies/homePage", {
        title: "loser",
        option: movieOption,
        // preference: user.preference
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

module.exports = router;
