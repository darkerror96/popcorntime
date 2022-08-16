const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 16;
const users = require("../data/users");
const validate = require("../utils/validation");

router.get("/", async (req, res) => {
  res.render("users/signup", {
    title: "Sign Up",
  });
});

router.post("/", async (req, res) => {
  try {
    const title = "Sign Up";
    const email = validate.checkEmail(req.body.email);
    const username = validate.checkUsername(req.body.username);
    const password = validate.checkPassword(req.body.password);
    const confirmPassword = validate.checkPassword(req.body.confirmPassword);

    const checkUser = await users.getUser(username);
    const checkEmail = await users.getUserByEmail(email);
    if (checkEmail) {
      let error = "Email already exists";
      res.render("users/signup", {
        error: error,
        title: title,
      });
    } else if (checkUser) {
      let error = "Username already exists";
      res.render("users/signup", {
        error: error,
        title: title,
      });
    } else if (password !== confirmPassword) {
      let error = "Passwords do not match";
      res.render("users/signup", {
        error: error,
        title: title,
      });
    } else {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        email: email,
        username: username,
        password: hashedPassword,
        first_name: "",
        last_name: "",
        birthday: "",
        role: "user",
        watch_list: [],
        preferences: {
          liked_genres: [],
          disliked_genres: [],
          liked_movies: [],
          disliked_movies: [],
          liked_actors: [],
          disliked_actors: [],
          liked_directors: [],
          disliked_directors: [],
        },
      };
      users.insertUser(newUser);
      console.log("User created");
      res.redirect("/");
    }
  } catch (e) {
    res.status(500).render("users/signup", {
      error: e,
      title: "Sign Up",
    });
  }
});

module.exports = router;
