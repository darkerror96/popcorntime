const {
  v4
} = require("uuid");

const express = require("express");
const router = express.Router();
const movies = require("../data/movies");
const users = require("../data/users");
const validation = require("../utils/validation");
const wordCheck = require("../utils/wordCheck");

var multer = require("multer");
let fs = require("fs-extra");

require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path = process.env.POSTER_FILE_PATH + Date.now() + `/`;
    fs.mkdirsSync(path);
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// for parsing multipart/form-data and storing files
const Data = multer({
  storage: storage,
});

router.post("/add", Data.any("poster"), async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id || req.session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  let {
    name,
    summary,
    genres,
    duration,
    release_date,
    cast,
    director
  } =
  JSON.parse(req.body.movieData);

  let poster = req.files[0].path;

  try {
    name = validation.checkStringNoRegex(name, "Movie Name");
    summary = validation.checkStringNoRegex(summary, "Summary");
    genres = validation.checkStringArray(genres, "Genre");
    duration = validation.checkNumber(duration, "Duration", 1, 5000);
    poster = validation.checkPosterFilePath(poster, "Poster file path");
    release_date = validation.checkDate(release_date, "Release Date");
    cast = validation.checkStringArray(cast, "Cast");
    director = validation.checkStringArray(director, "Director");
  } catch (e) {
    return res.status(400).json({
      error: e,
    });
  }

  try {
    const newMovie = await movies.addMovie(name, summary, genres, duration, poster, release_date, cast, director, 0);

    return res.status(201).json({
      status: 201,
      movieID: newMovie._id,
    });
  } catch (e) {
    return res.status(500).json({
      error: e,
    });
  }
});

router.post("/edit", Data.any("poster"), async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id || req.session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  let {
    id,
    name,
    summary,
    genres,
    duration,
    release_date,
    cast,
    director
  } =
  JSON.parse(req.body.movieData);

  let posterUpdate = false;
  let poster = "";
  if (req.files && req.files.length > 0 && req.files[0] && req.files[0].path) {
    poster = req.files[0].path;
    posterUpdate = true;
  }

  try {
    id = validation.checkId(id, "Movie ID");
    name = validation.checkStringNoRegex(name, "Movie Name");
    summary = validation.checkStringNoRegex(summary, "Summary");
    genres = validation.checkStringArray(genres, "Genre");
    duration = validation.checkNumber(duration, "Duration", 1, 5000);

    if (posterUpdate) poster = validation.checkPosterFilePath(poster, "Poster file path");

    release_date = validation.checkDate(release_date, "Release Date");
    cast = validation.checkStringArray(cast, "Cast");
    director = validation.checkStringArray(director, "Director");
  } catch (e) {
    return res.status(400).json({
      error: e,
    });
  }

  try {
    const existingMovie = await movies.updateMovie(id, name, summary, genres, duration, poster, release_date, cast, director, posterUpdate);

    return res.status(201).json({
      status: 200,
      movieID: existingMovie._id,
    });
  } catch (e) {
    return res.status(500).json({
      error: e,
    });
  }
});

router.get("/add", async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id || req.session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  res.render("../views/movies/add_movie", {
    title: "Add Movie",
  });
});

router.get("/edit/:id", async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id || req.session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  try {
    let id = req.params.id;
    id = validation.checkId(id, "Movie ID");
    const movie = await movies.getMovieById(id);

    if (movie) {
      res.render("../views/movies/edit_movie", {
        title: "Edit / Delete Movie",
        movie: movie,
      });
    } else {
      res.redirect("/");
    }
  } catch (e) {
    res.redirect("/");
  }
});

router.get("/:id", async (req, res) => {
  if (req.session && req.session.user && req.session.user.id) {
    let id = req.params.id;
    id = validation.checkId(id, "Id url param");
    const movie = await movies.getMovieById(id);

    let userIds = [];
    pushFieldToArray(userIds, movie.reviews, "user_id");
    pushFieldsToArray(userIds, movie.reviews, "likes");
    pushFieldsToArray(userIds, movie.reviews, "dislikes");

    let userIdsResult = undefined;
    try {
      userIdsResult = await users.getUsersById(userIds);
      if (!userIdsResult) {
        throw `No movie found with id ${id}`;
      }
    } catch (e) {
      res.status(404).render("movies/error", {
        title: "No Movie Found",
        hasErrors: true,
        error: "No Movie Found with Movie ID = `" + req.params.id + "`",
      });
    }
    let usersResultMap = {};
    userIdsResult.forEach((user) => {
      usersResultMap[user._id.toString()] = user.username;
    });
    let reviewsWithUserName = [];
    let wordMap = new Map();
    movie.reviews.forEach((review) => {
      let likesWithUserName = getLikesWithUserName(review, usersResultMap);
      let dislikesWithUserName = getDislikesWithUserName(
        review,
        usersResultMap
      );
      let currentUserInLikes = review.likes.filter(
        (like) => like === req.session.user.id
      );
      let currentUserInDislikes = review.dislikes.filter(
        (dislike) => dislike === req.session.user.id
      );

      let timestamp = createTimestampWithElapsedTime(review.timestamp);

      review.comment.split(" ").forEach((word) => {
        let wordLowerCase = word
          .trim()
          .replace(".", "")
          .replace(",", "")
          .replace("_", "")
          .replace("!", "")
          .toLowerCase();
        if (wordLowerCase && wordLowerCase.length > 0) {
          if (wordMap.get(wordLowerCase)) {
            let count = parseInt(wordMap.get(wordLowerCase), 10);
            wordMap.set(wordLowerCase, count + 1);
          } else {
            wordMap.set(wordLowerCase, 1);
          }
        }
      });

      reviewsWithUserName.push({
        user: usersResultMap[review.user_id],
        // TODO Change this today-n days|weeks|months|years ago
        timestamp: timestamp,
        rating: review.rating.toFixed(0),
        comment: review.comment,
        commentId: review.comment_id,
        likes: likesWithUserName,
        likesCount: review.likes ? review.likes.length : 0,
        dislikes: dislikesWithUserName,
        dislikesCount: review.dislikes ? review.dislikes.length : 0,
        likedByCurrentUser: currentUserInLikes.length > 0 ? true : false,
        dislikedByCurrentUser: currentUserInDislikes.length > 0 ? true : false,
      });
    });

    topWordsArray = getTop5Keywords(wordMap);

    reviewsWithUserName = reviewsWithUserName.sort((a, b) => {
      return b.likesCount - b.dislikesCount - (a.likesCount - a.dislikesCount);
    });
    movie.avg_rating = movie.avg_rating.toFixed(1);

    movie.duration = `${Math.floor(movie.duration / 60)} hours, ${
      movie.duration % 60
    } minutes`;

    res.render("movies/moviePage", {
      title: movie.name,
      movie: movie,
      reviewsWithUserName: reviewsWithUserName,
      topWordsArray: topWordsArray,
    });
  } else {
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.post("/:id/comment", async (req, res) => {
  if (req.session && req.session.user && req.session.user.id) {
    let id = req.params.id;
    id = validation.checkId(id, "Id url param");
    const requestBody = req.body;

    try {
      requestBody.rating = validation.checkNumber(
        requestBody.rating,
        "Rating",
        1,
        10
      );
      requestBody.comment = validation.checkString(
        requestBody.comment,
        "comment"
      );
    } catch (e) {
      res.status(400).json(e).send();
      return;
    }

    const movie = await movies.getMovieById(id);
    const currAverage = movie.avg_rating;
    const numOfReviews =
      movie.reviews && movie.reviews.length ? movie.reviews.length : 0;
    const newNumOfReviews = numOfReviews + 1;
    const newAverage =
      (currAverage * numOfReviews + requestBody.rating) / newNumOfReviews;
    let uuid = v4();
    const currentReview = {
      comment_id: uuid,
      user_id: req.session.user.id,
      timestamp: new Date().toISOString(),
      rating: requestBody.rating,
      comment: requestBody.comment,
      likes: [],
      dislikes: [],
    };

    if (!movie.reviews) {
      movie.reviews = [];
    }
    movie.reviews.push(currentReview);

    try {
      await movies.updateReviewsAndRating(id, movie.reviews, newAverage);
      let timestamp = createTimestampWithElapsedTime(new Date().toISOString());
      let responseBody = {
        commentId: uuid,
        comment: requestBody.comment,
        rating: requestBody.rating,
        user: req.session.user,
        timestamp: timestamp,
        likes: getLikesWithUserName({}, {}),
        dislikes: getDislikesWithUserName({}, {}),
        newAverage: newAverage.toFixed(1),
        newNumOfReviews: newNumOfReviews,
      };
      res.status(200).json(responseBody).send();
      return;
    } catch (e) {
      res.status(500).json(e).send();
      return;
    }
  } else {
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.post("/:movieId/comment/:commentId/:action", async (req, res) => {
  if (req.session && req.session.user && req.session.user.id) {
    const movieId = req.params.movieId;
    const commentId = req.params.commentId;
    const action = req.params.action;

    const movie = await movies.getMovieById(movieId);
    let userIds = [];
    pushFieldToArray(userIds, movie.reviews, "user_id");
    pushFieldsToArray(userIds, movie.reviews, "likes");
    pushFieldsToArray(userIds, movie.reviews, "dislikes");

    try {
      userIdsResult = await users.getUsersById(userIds);
      if (!userIdsResult) {
        throw `No movie found with id ${id}`;
      }
    } catch (e) {
      res.status(404).json("No Movie Found").send();
      return;
    }
    let usersResultMap = {};
    userIdsResult.forEach((user) => {
      usersResultMap[user._id.toString()] = user.username;
    });

    const review = movie.reviews.find(
      (review) => review.comment_id === commentId
    );
    if (!review) {
      res.status(404).json("Comment does not exist").send();
      return;
    }

    let likesWithUserName = "";
    let dislikesWithUserName = getDislikesWithUserName(review, usersResultMap);

    if (action === "like") {
      const currentUserInLikes = review.likes.find(
        (likedUser) => likedUser === req.session.user.id
      );
      if (currentUserInLikes) {
        res.status(304).send();
        return;
      } else {
        const currentUserInDislikes = review.dislikes.find(
          (dislikedUser) => dislikedUser === req.session.user.id
        );
        if (currentUserInDislikes) {
          res.status(409).json("Cannot like a disliked comment").send();
          return;
        }
        review.likes.push(req.session.user.id);
        movie.reviews.map((currReview) =>
          currReview.comment_id === commentId ? review : currReview
        );
        likesWithUserName = getLikesWithUserName(review, usersResultMap);
        movies.updateReviews(movieId, movie.reviews);
        res
          .status(200)
          .json({
            currentCommentLikes: review.likes.length,
            likesWithUserName: likesWithUserName,
          })
          .send();
        return;
      }
    }

    if (action === "unlike") {
      const currentUserInLikes = review.likes.find(
        (likedUser) => likedUser === req.session.user.id
      );
      if (currentUserInLikes) {
        review.likes = review.likes.filter(
          (likedUser) => likedUser !== req.session.user.id
        );
        movie.reviews.map((currReview) =>
          currReview.comment_id === commentId ? review : currReview
        );
        likesWithUserName = getLikesWithUserName(review, usersResultMap);
        movies.updateReviews(movieId, movie.reviews);
        res
          .status(200)
          .json({
            currentCommentLikes: review.likes.length,
            likesWithUserName: likesWithUserName,
          })
          .send();
        return;
      } else {
        res
          .status(404)
          .json("Unable to unlike. This comment was never liked")
          .send();
        return;
      }
    }

    if (action === "dislike") {
      const currentUserInDislikes = review.dislikes.find(
        (dislikedUser) => dislikedUser === req.session.user.id
      );
      if (currentUserInDislikes) {
        res.status(304).send();
        return;
      } else {
        const currentUserInLikes = review.likes.find(
          (likedUser) => likedUser === req.session.user.id
        );
        if (currentUserInLikes) {
          res.status(409).json("Cannot dislike a liked comment").send();
          return;
        }
        review.dislikes.push(req.session.user.id);
        movie.reviews.map((currReview) =>
          currReview.comment_id === commentId ? review : currReview
        );
        dislikesWithUserName = getDislikesWithUserName(review, usersResultMap);
        movies.updateReviews(movieId, movie.reviews);
        res
          .status(200)
          .json({
            currentCommentDislikes: review.dislikes.length,
            dislikesWithUserName: dislikesWithUserName,
          })
          .send();
        return;
      }
    }

    if (action === "undislike") {
      const currentUserInDislikes = review.dislikes.find(
        (dislikedUser) => dislikedUser === req.session.user.id
      );
      if (currentUserInDislikes) {
        review.dislikes = review.dislikes.filter(
          (dislikedUser) => dislikedUser !== req.session.user.id
        );
        movie.reviews.map((currReview) =>
          currReview.comment_id === commentId ? review : currReview
        );
        dislikesWithUserName = getDislikesWithUserName(review, usersResultMap);
        movies.updateReviews(movieId, movie.reviews);
        res
          .status(200)
          .json({
            currentCommentDislikes: review.dislikes.length,
            dislikesWithUserName: dislikesWithUserName,
          })
          .send();
        return;
      } else {
        res
          .status(404)
          .json("Unable to undislike. This comment was never disliked")
          .send();
        return;
      }
    }
  } else {
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

function createTimestampWithElapsedTime(reviewTimestamp) {
  let currentTime = new Date();
  let reviewDateTimestamp = new Date(reviewTimestamp);
  let secondsPassed = Math.round(
    (currentTime.getTime() - reviewDateTimestamp.getTime()) / 1000
  );

  let timePassed = "";
  if (secondsPassed < 60) {
    timePassed = `Just now`;
  } else if (secondsPassed < 3600) {
    timePassedPrefix = Math.floor(secondsPassed / 60);
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} minute ago`;
    } else {
      timePassed = `about ${timePassedPrefix} minutes ago`;
    }
  } else if (secondsPassed < 3600 * 24) {
    timePassedPrefix = Math.floor(secondsPassed / 3600);
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} hour ago`;
    } else {
      timePassed = `about ${timePassedPrefix} hours ago`;
    }
  } else if (secondsPassed < 3600 * 24 * 7) {
    timePassedPrefix = Math.floor(secondsPassed / (3600 * 24));
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} day ago`;
    } else {
      timePassed = `about ${timePassedPrefix} days ago`;
    }
  } else if (secondsPassed < 3600 * 24 * 30) {
    timePassedPrefix = Math.floor(secondsPassed / (3600 * 24 * 7));
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} week ago`;
    } else {
      timePassed = `about ${timePassedPrefix} weeks ago`;
    }
  } else if (secondsPassed < 3600 * 24 * 365) {
    timePassedPrefix = Math.floor(secondsPassed / (3600 * 24 * 30));
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} month ago`;
    } else {
      timePassed = `about ${timePassedPrefix} months ago`;
    }
  } else {
    timePassedPrefix = Math.floor(secondsPassed / (3600 * 24 * 365));
    if (timePassedPrefix == 1) {
      timePassed = `about ${timePassedPrefix} year ago`;
    } else {
      timePassed = `about ${timePassedPrefix} years ago`;
    }
  }
  let time = new Date(reviewTimestamp).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "short",
    timeStyle: "short",
  });
  let timestamp = `${time} (${timePassed})`;
  return timestamp;
}

function pushFieldToArray(targetArray, inputArray, fieldInArrayElement) {
  if (inputArray) {
    inputArray.forEach((input) => {
      if (input && input[fieldInArrayElement]) {
        targetArray.push(input[fieldInArrayElement]);
      }
    });
  }
}

function pushFieldsToArray(targetArray, inputArray, fieldInArrayElement) {
  if (inputArray) {
    inputArray.forEach((input) => {
      if (input && input[fieldInArrayElement]) {
        input[fieldInArrayElement].forEach((element) => {
          if (element) {
            targetArray.push(element);
          }
        });
      }
    });
  }
}

function getLikesWithUserName(review, usersResultMap) {
  let likesWithUserName = "";
  if (review.likes && review.likes.length > 0) {
    likesWithUserName = "Liked by";
    for (let i = 0; i < review.likes.length; i++) {
      if (i > 5) {
        break;
      }
      if (i != 0) {
        likesWithUserName = likesWithUserName + ",";
      }
      likesWithUserName =
        likesWithUserName + " " + usersResultMap[review.likes[i]];
    }
  } else {
    likesWithUserName = "No likes yet";
  }
  return likesWithUserName;
}

function getDislikesWithUserName(review, usersResultMap) {
  let dislikesWithUserName = "";
  if (review.dislikes && review.dislikes.length > 0) {
    dislikesWithUserName = "Disliked by";
    for (let i = 0; i < review.dislikes.length; i++) {
      if (i > 5) {
        dislikesWithUserName += " and many more";
        break;
      }
      if (i != 0) {
        dislikesWithUserName = dislikesWithUserName + ",";
      }
      dislikesWithUserName =
        dislikesWithUserName + " " + usersResultMap[review.dislikes[i]];
    }
  } else {
    dislikesWithUserName = "No dislikes yet";
  }
  return dislikesWithUserName;
}

function getTop5Keywords(wordMap) {
  // Remove common words
  wordMap = wordCheck.removePrepositions(wordMap);

  wordMap.delete("but");
  wordMap.delete("film");
  wordMap.delete("how");
  wordMap.delete("i");
  wordMap.delete("is");
  wordMap.delete("movie");
  wordMap.delete("sometimes");
  wordMap.delete("that");
  wordMap.delete("the");
  wordMap.delete("this");
  wordMap.delete("too");

  wordMap = new Map([...wordMap.entries()].sort((a, b) => b[1] - a[1]));

  let arrayLength = 0;
  let wordMapArray = [];
  for (let [keyword, count] of wordMap.entries()) {
    if (arrayLength < 5) {
      wordMapArray.push(`${keyword} (${count} entries)`);
      arrayLength++;
    } else {
      break;
    }
  }

  return wordMapArray;
}

module.exports = router;