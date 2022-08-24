const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 16;
const users = require("../data/users");
const validate = require("../utils/validation");
const xss = require("xss");

router.get("/", async (req, res) => {
  res.render("users/signup", {
    title: "Sign Up",
  });
});

router.post("/", async (req, res) => {
  try {
    const title = "Sign Up";
    let email = xss(req.body.email);
    email = validate.checkEmail(email);
    let username = xss(req.body.username);
    username = validate.checkUsername(username);
    let firstName = xss(req.body.first_name);
    firstName = validate.checkString(firstName);
    let lastName = xss(req.body.last_name);
    validate.checkString(lastName);
    let birthday = xss(req.body.birthday);
    birthday = validate.checkDate(birthday);
    let password = xss(req.body.password);
    password = validate.checkPassword(password);
    let confirmPassword = xss(req.body.confirmPassword);
    confirmPassword = validate.checkPassword(confirmPassword);

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
        first_name: firstName,
        last_name: lastName,
        birthday: birthday,
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
      req.session.success = true;
      res.redirect("/login");
    }
  } catch (e) {
    res.status(500).render("users/signup", {
      error: e,
      title: "Sign Up",
    });
  }
});

module.exports = router;