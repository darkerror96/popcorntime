const express = require("express");
const router = express.Router();
const users = require("../data/users");
const movies = require("../data/movies");
const validation = require("../utils/validation");

router.get("/", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  // req.session = {};
  req.session.user = "john_doe";
  if (true || (req.session && req.session.user)) {
    const user = await users.getUser(req.session.user);
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
    let movieId = req.params.id;
    try {
      movieId = validation.checkId(movieId, "Id url param");
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }

    try {
      const user = await users.getUserById(req.session.user_id);
      const index = user.watch_list.findIndex(
        (watchListMovieId) => movieId === watchListMovieId
      );
      if (index === -1) {
        users.addToWatchList(req.session.user_id, movieId);
        res.status(200).send();
      } else {
        res.status(304).send();
      }
      return;
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }
    return;
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.post("/prefs", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  // req.session = {};
  req.session.user = "john_doe";
  req.session.user_id = "62edec84bcd3a79c27abaa0c";
  if (true || (req.session && req.session.user)) {
    let requestBody = undefined;
    let preferenceCategory = undefined;
    let preferenceValue = undefined;
    try {
      requestBody = req.body;
      if (!requestBody) {
        throw `Request body is empty`;
      }

      preferenceCategory = requestBody.preferenceCategory;
      preferenceValue = requestBody.preferenceValue;

      preferenceCategory =
        validation.checkPreferenceCategory(preferenceCategory);
      if (
        preferenceCategory == "liked_movies" ||
        preferenceCategory == "disliked_movies"
      ) {
        preferenceValue = validation.checkId(
          preferenceValue,
          "preferenceValue"
        );
      } else {
        preferenceValue = validation.checkString(
          preferenceValue,
          "preferenceValue"
        );
      }
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }

    try {
      const user = await users.getUserById(req.session.user_id);
      if (!user.preferences) {
        user.preferences = {};
      }

      // Disallow liking and disliking the same item
      let oppositeCategory = preferenceCategory.includes("disliked")
        ? preferenceCategory.replace("disliked", "liked")
        : preferenceCategory.replace("liked", "disliked");

      let preferenceSubSection = user.preferences[preferenceCategory];
      let oppositeSubSection = user.preferences[oppositeCategory];

      if (!oppositeSubSection) {
        oppositeSubSection = [];
      }
      let oppositeIndex = oppositeSubSection.findIndex(
        (value) => value === preferenceValue
      );
      if (oppositeIndex !== -1) {
        res
          .status(400)
          .json(`Both likes and dislikes can't have this preference`);
        return;
      }

      if (!preferenceSubSection) {
        preferenceSubSection = [];
      }
      const index = preferenceSubSection.findIndex(
        (value) => value === preferenceValue
      );
      if (index === -1) {
        preferenceSubSection.push(preferenceValue);
        user.preferences[preferenceCategory] = preferenceSubSection;
        users.updatePreferences(req.session.user_id, user.preferences);
        res.status(200).send();
      } else {
        res.status(304).send();
      }
      return;
    } catch (e) {
      res.status(500).json(e).send();
      return;
    }
    return;
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.delete("/watchlist/:id", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  // req.session = {};
  req.session.user = "john_doe";
  req.session.user_id = "62edec84bcd3a79c27abaa0c";
  if (true || (req.session && req.session.user)) {
    let movieId = req.params.id;
    try {
      movieId = validation.checkId(movieId, "Id url param");
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }

    try {
      const user = await users.getUserById(req.session.user_id);
      const index = user.watch_list.findIndex(
        (watchListMovieId) => movieId === watchListMovieId
      );
      if (index === -1) {
        res.status(404).send();
      } else {
        users.removeFromWatchList(req.session.user_id, movieId);
        res.status(200).send();
      }
      return;
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }
    return;
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.delete("/prefs", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  // req.session = {};
  req.session.user = "john_doe";
  req.session.user_id = "62edec84bcd3a79c27abaa0c";
  if (true || (req.session && req.session.user)) {
    let requestBody = undefined;
    let preferenceCategory = undefined;
    let preferenceValue = undefined;
    try {
      requestBody = req.body;
      if (!requestBody) {
        throw `Request body is empty`;
      }

      preferenceCategory = requestBody.preferenceCategory;
      preferenceValue = requestBody.preferenceValue;

      preferenceCategory =
        validation.checkPreferenceCategory(preferenceCategory);
      if (
        preferenceCategory == "liked_movies" ||
        preferenceCategory == "disliked_movies"
      ) {
        preferenceValue = validation.checkId(
          preferenceValue,
          "preferenceValue"
        );
      } else {
        preferenceValue = validation.checkString(
          preferenceValue,
          "preferenceValue"
        );
      }
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }

    try {
      const user = await users.getUserById(req.session.user_id);
      if (!user.preferences) {
        user.preferences = {};
      }

      let preferenceSubSection = user.preferences[preferenceCategory];
      if (!user.preferences[preferenceCategory]) {
        preferenceSubSection = [];
      }
      const index = preferenceSubSection.findIndex(
        (value) => value === preferenceValue
      );
      if (index === -1) {
        res.status(404).send();
      } else {
        preferenceSubSection = preferenceSubSection.filter(
          (value) => value != preferenceValue
        );
        user.preferences[preferenceCategory] = preferenceSubSection;
        users.updatePreferences(req.session.user_id, user.preferences);
        res.status(200).send();
      }
      return;
    } catch (e) {
      res.status(500).json(e).send();
      return;
    }
    return;
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
