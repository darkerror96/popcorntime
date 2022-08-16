const searchRoutes = require("./search");
const movieRoutes = require("./movies");
const signupRoutes = require("./signup");
const profileRoutes = require("./profile");
const loginRoutes = require("./login");
const logoutRoutes = require("./logout");
const adminRoutes = require("./admin");
const path = require("path");
const hallOfFameRoutes = require("./hall_of_fame");

const constructorMethod = (app) => {
  var movieOption = ["Movie", "Cast", "Director", "Year"];
  app.get("/", (req, res) => {
    res.render("movies/homePage", {
      title: "Flick Finder",
      option: movieOption,
    });
  });

  app.use("/search", searchRoutes);
  app.use("/movies", movieRoutes);
  app.use("/signup", signupRoutes);
  app.use("/profile", profileRoutes);
  app.use("/login", loginRoutes);
  app.use("/logout", logoutRoutes);
  app.use("/admin", adminRoutes);
  app.use("/halloffame", hallOfFameRoutes);

  app.use("*", (req, res) => {
    res.sendFile(path.resolve("static/404.html"));
  });
};

module.exports = constructorMethod;
