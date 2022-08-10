const express = require("express");
const router = express.Router();
const movies = require("../data/movies");
const users = require("../data/users");
const validation = require("../utils/validation");

router.get("/:id", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  req.session = {};
  req.session.user = "john_doe";
  if (true || (req.session && req.session.user)) {
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
        error: "No Movie Found with Movie ID = `" + Number(req.params.id) + "`",
      });
    }
    let usersResultMap = {};
    userIdsResult.forEach((user) => {
      usersResultMap[user._id.toString()] = user.username;
    });
    let reviewsWithUserName = [];
    movie.reviews.forEach((review) => {
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
      let timestampIso = new Date(review.timestamp);
      reviewsWithUserName.push({
        user: usersResultMap[review.user_id],
        // TODO Change this today-n days|weeks|months|years ago
        timestamp: timestampIso.toISOString().substring(0, 10),
        rating: review.rating,
        comment: review.comment,
        likes: likesWithUserName,
        likesCount: review.likes ? review.likes.length : 0,
        dislikes: dislikesWithUserName,
        dislikesCount: review.dislikes ? review.dislikes.length : 0,
      });
    });

    res.render("movies/single", {
      title: movie.name,
      movie: movie,
      reviewsWithUserName: reviewsWithUserName,
    });
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render("../views/users/signup", {
      message: "You need to be signed up to access this page",
    });
    return;
  }
});

router.post("/:id/comment", async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  // TODO Cache both username and userid
  req.session = {};
  req.session.user = "john_doe";
  req.session.user_id = "62edec84bcd3a79c27abaa0c";
  if (true || (req.session && req.session.user)) {
    let id = req.params.id;
    id = validation.checkId(id, "Id url param");
    const requestBody = req.body;

    try {
      requestBody.rating = validation.checkNumber(
        requestBody.rating,
        "rating",
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
    const newAverage =
      (currAverage * numOfReviews + requestBody.rating) / (numOfReviews + 1);
    // ).toPrecision(3);
    const currentReview = {
      user_id: req.session.user_id,
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
      res.status(200).json();
      return;
    } catch (e) {
      res.status(500).json(e).send();
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

module.exports = router;
