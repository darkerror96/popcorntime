const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../data/users");
const validate = require("../utils/validation");
const xss = require("xss");

router.get("/", async (req, res) => {
  if (req.session.success === true) {
    req.session.success = false;
    res.render("users/login", {
      title: "Login",
      success: "Account successfully created, please login",
    });
  } else {
    res.render("users/login", {
      title: "Login",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    let username = xss(req.body.username);
    username = validate.checkUsername(username);
    let password = xss(req.body.password);
    password = validate.checkPassword(password);
    const userAttempt = await user.getUser(username);
    if (userAttempt) {
      const hashedPassword = userAttempt.password;
      if (hashedPassword) {
        if (await bcrypt.compare(password, hashedPassword)) {
          req.session.user = {
            username: username,
            id: userAttempt._id,
            role: userAttempt.role,
          };
          res.redirect("/");
        } else {
          let error = "Invalid password";
          res.status(401).render("users/login", {
            error: error,
            title: "Login",
          });
        }
      }
    } else {
      let error = "Invalid username";
      res.status(401).render("users/login", {
        error: error,
        title: "Login",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).render("users/login", {
      error: e,
      title: "Login",
    });
  }
});

module.exports = router;
