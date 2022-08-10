const searchRoutes = require('./search');
const showsRoutes = require('./shows');
const signupRoutes = require('./signup');
const profileRoutes = require('./profile');
const movieRoutes = require('./movies');
const path = require('path');

const constructorMethod = (app) => {
    app.get('/', (req, res) => {
        res.render('shows/new', {
            title: "Flick Finder"
        });
    });

    app.use('/movies', movieRoutes);
    app.use('/search', searchRoutes);
    app.use('/shows', showsRoutes);
    app.use('/signup', signupRoutes);
    app.use('/profile', profileRoutes);

    app.use('*', (req, res) => {
        res.sendFile(path.resolve('static/404.html'));
    });
};

module.exports = constructorMethod;