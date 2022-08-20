const express = require("express");
const app = express();
const static = express.static(__dirname + "/public");

const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const session = require("express-session");

var cors = require("cors");

//mongodb
const connection = require("./config/mongoConnection");

const main = async () => {
  await connection.dbConnection();
  console.log("Connected to database");

  //Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins
  app.use(cors());

  app.use(
    session({
      name: "PopcornTimeCookie",
      secret: "eikooCemiTnrocpoP",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(async (req, res, next) => {
    if (req.session.user) {
      res.locals.username = req.session.user.username;
      res.locals.role = req.session.user.role;
    }
    next();
  });

  app.use("/login", (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    } else {
      next();
    }
  });

  app.use("/signup", (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    } else {
      next();
    }
  });

  app.use("/admin", (req, res, next) => {
    if (req.session.user) {
      if (req.session.user.role === "admin") {
        next();
      } else {
        return res.redirect("/");
      }
    } else {
      return res.redirect("/");
    }
  });

  app.use("/public", static);
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.engine(
    "handlebars",
    exphbs.engine({
      defaultLayout: "main",
    })
  );
  app.set("view engine", "handlebars");

  hbs = exphbs.create({});
  hbs.handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  hbs.handlebars.registerHelper("increment", function (arg1, options) {
    return arg1 + 1;
  });

  hbs.handlebars.registerHelper(
    "isInWatchList",
    function (array, value, options) {
      value = value.toString();
      if (array.includes(value)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  );

  configRoutes(app);

  app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
  });
};

main();
