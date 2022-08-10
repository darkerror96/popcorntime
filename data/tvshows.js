const axios = require("axios");
const validation = require('./validation');

async function searchMovieAPI(searchTerm){
    const {data} = await axios.get('https://www.omdbapi.com/?apikey=58db0176&s=' + searchTerm);
    return data;
}

async function searchMovie(searchTerm) {

    validation.validateString("searchTerm", searchTerm);

    const data = await searchMovieAPI(searchTerm);
    console.log("option a" + data.Search[0].imdbID);
    
    let movieResult = [];
    let movieCounter = 0;
    for (var i = 0; i < data.Search.length; i++) {
        // movie = {
        //     'id': temp.Search.imdbID,
        //     'name': temp.Search.Title
        // }
        movieResult.push(data.Search[i]);
        movieCounter++;

        if (movieCounter === 10) {
            break;
        }
    }

    return movieResult;
}

async function getMovieAPI(imdbID) {
    const {
        data
    } = await axios.get('https://www.omdbapi.com/?apikey=58db0176&i=' + imdbID);
    return data;
}

async function getMovie(imdbID) {


    validation.validateString("imdbID", imdbID);


    const data = await getMovieAPI(imdbID);

    if (data.Title == null) {
        throw "Movie not found for ID = `" + imdbID + "`";
    }

    return data;
}

module.exports = {
    searchMovie,
    searchMovieAPI,
    getMovie,
    getMovieAPI

    
};
