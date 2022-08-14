const {
  v4
} = require("uuid");

const express = require("express");
const router = express.Router();
const movies = require("../data/movies");
const users = require("../data/users");
const validation = require("../utils/validation");

var multer = require("multer");
let fs = require("fs-extra");

require('dotenv').config();

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

  // if (req.session.user) {
  //     logger(req.method, req.originalUrl, true);
  //     res.render('../views/movies/add_movie', {});
  // } else {
  //     logger(req.method, req.originalUrl, false);
  //     res.status(401).render('../views/login_logout/login', {});
  //     return;
  // }

  let {
    name,
    summary,
    genres,
    duration,
    release_date,
    cast,
    director
  } = JSON.parse(req.body.movieData);

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
    console.log(e);
    return res.status(400).json({
      error: e,
    });
  }

  try {
    const newMovie = await movies.addMovie(name, summary, genres, duration, poster, release_date, cast, director);
    return res.status(201).json({
      status: 201,
      movieID: newMovie._id,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: e,
    });
  }
});

router.get("/add", async (req, res) => {

  // if (req.session.user) {
  //     logger(req.method, req.originalUrl, true);
  //     res.render('../views/movies/add_movie', {});
  // } else {
  //     logger(req.method, req.originalUrl, false);
  //     res.status(401).render('../views/login_logout/login', {});
  //     return;
  // }

  res.render("../views/movies/add_movie", {
    title: "Add Movie",
  });
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
    movie.reviews.forEach((review) => {
      let likesWithUserName = getLikesWithUserName(review, usersResultMap);
      let dislikesWithUserName = getDislikesWithUserName(
        review,
        usersResultMap
      );
      let timestampIso = new Date(review.timestamp);
      let currentUserInLikes = review.likes.filter(
        (like) => like === req.session.user.id
      );
      let currentUserInDislikes = review.dislikes.filter(
        (dislike) => dislike === req.session.user.id
      );
      reviewsWithUserName.push({
        user: usersResultMap[review.user_id],
        // TODO Change this today-n days|weeks|months|years ago
        timestamp: timestampIso.toISOString().substring(0, 10),
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
    movie.avg_rating = movie.avg_rating.toFixed(1);

    movie.duration = `${Math.floor(movie.duration / 60)} hours, ${
      movie.duration % 60
    } minutes`;

    res.render("movies/moviePage", {
      title: movie.name,
      movie: movie,
      reviewsWithUserName: reviewsWithUserName,
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
      let responseBody = {
        commentId: uuid,
        comment: requestBody.comment,
        rating: requestBody.rating,
        user: req.session.user,
        date: new Date().toJSON().slice(0, 10),
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

module.exports = router;