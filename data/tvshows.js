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
    // searchTVShows,
    // searchTVShowsAPI,
    // getTVShow,
    // getTVShowAPI
};

// async function searchTVShowsAPI(searchTerm) {
//     const {
//         data
//     } = await axios.get('http://api.tvmaze.com/search/shows?q=' + searchTerm);
//     return data;
// }

// async function getTVShowAPI(showID) {
//     const {
//         data
//     } = await axios.get('http://api.tvmaze.com/shows/' + showID);
//     return data;
// }


// async function searchTVShows(searchTerm) {

//     validation.validateString("searchTerm", searchTerm);

//     const data = await searchTVShowsAPI(searchTerm);

//     let tvShowsResult = [];
//     let tvShowCounter = 0;
//     for (let temp of data) {
//         show = {
//             'id': temp.show.id,
//             'name': temp.show.name
//         }
//         tvShowsResult.push(show);
//         tvShowCounter++;

//         if (tvShowCounter === 10) {
//             break;
//         }
//     }

//     return tvShowsResult;
// }

// async function getTVShow(showID) {

//     validation.validateNumber("showID", showID);

//     const data = await getTVShowAPI(showID);

//     if (data.id == null) {
//         throw "TV Show not found for ID = `" + showID + "`";
//     }

//     return data;
// }

