const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const session = require('express-session');

//mongodb
const connection = require('./config/mongoConnection');

const main = async () => {
const db = await connection.dbConnection();
console.log("Connected to database");

app.use(
    session({
        name: 'PopcornTimeCookie',
        secret: 'eikooCemiTnrocpoP',
        resave: false,
        saveUninitialized: true
    })
);

app.use(async (req, res, next) => {
    if(req.session.user){
        res.locals.username = req.session.user.username;
        res.locals.role = req.session.user.role;
    }
    next();
});

app.use('/login', (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/');
    } else {
        next();
    }
  });

  app.use('/signup', (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/');
    } else {
        next();
    }
  });

  app.use('/admin', (req, res, next) => {
    if(req.session.user.role !== 'admin'){
        return res.redirect('/');
    }else{
        next();
    }
  });

  hbs = exphbs.create({});
  hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
};

main();