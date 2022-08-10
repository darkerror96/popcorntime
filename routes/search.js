const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();
const tvshows = require('../data/tvshows');

router.post('/', async(req, res) => {
    let searchTerm = req.body.searchTerm;

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        res.status(400).render('movies/error', {
            title: "No Shows Found",
            hasErrors: true,
            error: 'TV Show search term can not be blank / empty or just spaces. Please try entering valid string search term!'
        });
        return;
    }

    try {
        let showList = await tvshows.searchMovie(searchTerm);

        if (showList.length == 0) {
            res.status(404).render('movies/error', {
                title: "No Movies Found",
                hasSearchError: true,
                searchTerm: searchTerm
            });
        } else {
            res.render('movies/index', {
                title: "Movies Found",
                shows: showList,
                searchTerm: searchTerm
            }); 
            
        }
    } catch (e) {
        res.status(500).render('movies/error', {
            title: "No Movies Found",
            hasErrors: true,
            error: e
        });
    }
});

module.exports = router;