// const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();
const movies = require("../data/movies");
const validation = require("../utils/validation");


router.post('/', async(req, res) => {
    let searchTerm = req.body.searchTerm;
    let searchType = req.body.options;

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        res.status(400).render('movies/error', {
            title: "No Movies Found",
            hasErrors: true,
            error: 'Movie search term can not be blank / empty or just spaces. Please try entering valid string search term!'
        });
        return;
    }

    try {
        let movieList = [];
        if(searchType == "Movie"){
            movieList = await movies.searchMovie(searchTerm);
        }else if(searchType == "Cast"){
            movieList = await movies.searchCast(searchTerm);
        }else if(searchType == "Director"){
            movieList = await movies.searchDirector(searchTerm);
        }
        if (movieList.length == 0) {
            res.status(404).render('movies/error', {
                title: "No Movies Found",
                hasSearchError: true,
                searchTerm: searchTerm
            });
        } else {
            res.render('movies/index', {
                title: "Movies Found",
                movies: movieList,
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