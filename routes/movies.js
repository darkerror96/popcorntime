const express = require('express');
const router = express.Router();
const tvshows = require('../data/tvshows');

router.get('/:id', async(req, res) => {
    try {
        let movie = await tvshows.getMovie(Number(req.params.id));

        if (!movie.Title) {
            movie.Title = "NA";
        }
        console.log("movie title is " + movie.Title);

        if (show.image) {
            if (!show.image.medium) {
                show.image.medium = "NA";
            }
        } else {
            show.image = {
                "medium": "NA"
            };
        }

        if (!show.language) {
            show.language = "NA";
        }

        if (show.genres.length == 0) {
            show.genres = ["NA"];
        }

        if (show.rating) {
            if (!show.rating.average) {
                show.rating.average = "NA";
            }
        } else {
            show.rating = {
                "average": "NA"
            };
        }

        if (show.network) {
            if (!show.network.name) {
                show.network.name = "NA";
            }
        } else {
            show.network = {
                "name": "NA"
            };
        }

        if (show.summary) {
            show.summary = show.summary.replace(/<[^>]*>?/gm, "");
        } else {
            show.summary = "NA";
        }

        res.render('shows/single', {
            show: show,
            title: show.name
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