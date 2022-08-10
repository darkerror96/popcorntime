const searchRoutes = require('./search');
const showsRoutes = require('./shows');
const movieRoutes = require('./movie');
const signupRoutes = require('./signup');
const profileRoutes = require('./profile');
const path = require('path');

const constructorMethod = (app) => {
    app.get('/', (req, res) => {
        res.render('shows/new', {
            title: "Show Finder"
        });
    });

    app.use('/search', searchRoutes);
    app.use('/movie', movieRoutes);
    app.use('/signup', signupRoutes);
    app.use('/profile', profileRoutes);

    app.use('*', (req, res) => {
        res.sendFile(path.resolve('static/404.html'));
    });
};

module.exports = constructorMethod;