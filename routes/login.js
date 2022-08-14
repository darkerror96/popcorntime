const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../data/users");

router.get("/", async (req, res) => {
  res.render("users/login", {
    title: "Login",
  });
});

router.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
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
});

module.exports = router;
