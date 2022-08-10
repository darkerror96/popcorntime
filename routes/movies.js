const express = require('express');
const router = express.Router();
const tvshows = require('../data/tvshows');

router.get('/:id', async(req, res) => {
    try {
        let movie = await tvshows.getMovie(req.params.id);

        if (!movie.Title) {
            movie.Title = "NA";
        }

        if (movie.Poster) {
            if (!movie.Poster.medium) {
                movie.Poster.medium = "NA";
            }
        } else {
            movie.Poster = {
                "medium": "NA"
            };
        }

        if (!movie.Language) {
            movie.Language = "NA";
        }

        if (!movie.Genre) {
            movie.Genre = "NA";
        }

        if (movie.Ratings.length == 0) {
            movie.Ratings = ["NA"];
        }

        if (!movie.Runtime){
            movie.Runtime = "NA";
        }

        if (!movie.Plot) {
            movie.Plot = "NA";
        }

        res.render('shows/single', {
            movie: movie,
            title: movie.Title
        });

    } catch (e) {
        if (e.response && e.response.status && e.response.status === 404) {
            res.status(404).render('shows/error', {
                title: "No TV Show Found",
                hasErrors: true,
                error: "No TV Show Found with TV Show ID = `" + Number(req.params.id) + "`"
            });
        } else {
            res.status(404).render('shows/error', {
                title: "No TV Show Found",
                hasErrors: true,
                error: e
            });
        }
    }
});

module.exports = router;