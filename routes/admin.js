const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.render("users/admin", {
    title: "Manage Movies"
  });
});

router.post("/", async (req, res) => {
  const option = req.body.admin_radio;
  if (option === "edit" || option === "delete") {
    res.redirect("/");
  } else if (option === "add") {
    res.redirect("/movies/add");
  }
});

module.exports = router;