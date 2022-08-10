const searchRoutes = require("./search");
const movieRoutes = require("./movies");
const signupRoutes = require("./signup");
const profileRoutes = require("./profile");
const path = require("path");

const constructorMethod = (app) => {
    app.get("/", (req, res) => {
      res.render("movies/new", {
        title: "Flick Finder",
      });
    });

  app.use("/search", searchRoutes);
  app.use("/movies", movieRoutes);
  app.use("/signup", signupRoutes);
  app.use("/profile", profileRoutes);

  app.use("*", (req, res) => {
    res.sendFile(path.resolve("static/404.html"));
  });
};

module.exports = constructorMethod;
