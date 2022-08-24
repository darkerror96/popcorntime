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
  let formData = {};
  try {
    formData = {
      email: xss(req.body.email),
      username: xss(req.body.username),
      first_name: xss(req.body.first_name),
      last_name: xss(req.body.last_name),
      birthday: xss(req.body.birthday),
      genres: xss(req.body.movieGenres),
      cast: xss(req.body.movieCast),
      director: xss(req.body.movieDirector),
    };

    const title = "Sign Up";
    let email = xss(req.body.email);
    email = validate.checkEmail(email);
    let username = xss(req.body.username);
    username = validate.checkUsername(username);
    let firstName = xss(req.body.first_name);
    firstName = validate.checkString(firstName, "First Name");
    let lastName = xss(req.body.last_name);
    validate.checkString(lastName, "Last Name");
    let birthday = xss(req.body.birthday);
    birthday = validate.checkDate(birthday, "Birthday");
    let password = xss(req.body.password);
    password = validate.checkPassword(password);
    let confirmPassword = xss(req.body.confirmPassword);
    confirmPassword = validate.checkPassword(confirmPassword);
    let genres = xss(req.body.movieGenres);
    genres = validate.checkString(genres, "Genres");
    let cast = xss(req.body.movieCast);
    cast = validate.checkString(cast, "Cast");
    let director = xss(req.body.movieDirector);
    director = validate.checkString(director, "Director");

    let genreArray = genres.split(",");
    let castArray = cast.split(",");
    let directorArray = director.split(",");

    for (let i = 0; i < genreArray.length; i++) {
      genreArray[i] = genreArray[i].trim();
      validate.checkString(genreArray[i], `Genre ${i + 1}`);
    }
    for (let i = 0; i < castArray.length; i++) {
      castArray[i] = castArray[i].trim();
      validate.checkString(castArray[i], `Cast ${i + 1}`);
    }
    for (let i = 0; i < directorArray.length; i++) {
      directorArray[i] = directorArray[i].trim();
      validate.checkString(directorArray[i], `Director ${i + 1}`);
    }

    const checkUser = await users.getUser(username);
    const checkEmail = await users.getUserByEmail(email);
    if (checkEmail) {
      let error = "Email already exists";
      res.render("users/signup", {
        error: error,
        title: title,
        formData: formData,
      });
    } else if (checkUser) {
      let error = "Username already exists";
      res.render("users/signup", {
        error: error,
        title: title,
        formData: formData,
      });
    } else if (password !== confirmPassword) {
      let error = "Passwords do not match";
      res.render("users/signup", {
        error: error,
        title: title,
        formData: formData,
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
          liked_genres: genreArray,
          disliked_genres: [],
          liked_movies: [],
          disliked_movies: [],
          liked_actors: castArray,
          disliked_actors: [],
          liked_directors: directorArray,
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
      formData: formData,
    });
  }
});

module.exports = router;