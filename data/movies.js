const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
const {
    ObjectId
} = require("mongodb");
const axios = require("axios");
const validation = require('./validation');

const exportedMethods = {
    async getMovieById(id) {
        const moviesCollection = await movies();
        const movie = await moviesCollection.findOne({
            _id: ObjectId(id)
        });
        return movie;
    },
    async getMoviesById(idArray) {
        const inputArray = [];
        let i = 0;
        for (i = 0; i < idArray.length; i++) {
            try {
                inputArray.push(ObjectId(idArray[i]));
            } catch (e) {
                console.log(`Converting to ObjectId failed for id `, idArray[i]);
                console.log(e);
            }
        }
        const moviesCollection = await movies();
        const moviesResult = await moviesCollection
            .find({
                _id: {
                    $in: inputArray,
                },
            })
            .toArray();
        return moviesResult;
    },
    async updateReviewsAndRating(id, reviews, newAverage) {
        const moviesCollection = await movies();
        const updateInfo = await moviesCollection.updateOne({
            _id: ObjectId(id)
        }, {
            $set: {
                reviews: reviews,
                avg_rating: newAverage,
            },
        });
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw "Update failed";
    },
    async updateReviews(id, reviews) {
        const moviesCollection = await movies();
        const updateInfo = await moviesCollection.updateOne({
            _id: ObjectId(id)
        }, {
            $set: {
                reviews: reviews,
            },
        });
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw "Update failed";
    },
    async searchMovie(searchTerm) {
        validation.validateString("searchTerm", searchTerm);

        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name.includes(searchTerm)) {
                movieResult.push(data[i]);
                movieCounter++;
                if (movieCounter === 10) {
                    break;
                }
            }
        }

        return movieResult;
    },
    async searchCast(searchTerm) {
        validation.validateString("searchTerm", searchTerm);
        const moviesCollection = await movies();
        const data = await moviesCollection.find({}, {
            cast: {
                $regex: searchTerm + '*',
                $options: 'i'
            }
        });
        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            movieResult.push(data[i].cast);
            movieCounter++;
            if (movieCounter === 10) {
                break;
            }
        }

        return movieResult;
    },
    async searchDirector(searchTerm) {
        validation.validateString("searchTerm", searchTerm);
        const moviesCollection = await movies();
        const data = await moviesCollection.find({}, {
            director: {
                $regex: searchTerm + '*',
                $options: 'i'
            }
        });
        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            movieResult.push(data[i].director);
            movieCounter++;
            if (movieCounter === 10) {
                break;
            }
        }

        return movieResult;
    },
    async searchYear(searchTerm) {
        validation.validateNumber("searchTerm", searchTerm);
        const moviesCollection = await movies();
        const data = await moviesCollection.find({}, {
            release_date: {
                $regex: '*' + searchTerm + '*',
                $options: 'i'
            }
        });
        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            movieResult.push(data[i].director);
            movieCounter++;
            if (movieCounter === 10) {
                break;
            }
        }

        return movieResult;
    },
    async searchMovieByAPI(searchTerm) {
        validation.validateString("searchTerm", searchTerm);

        const {
            data
        } = await axios.get('https://www.omdbapi.com/?apikey=58db0176&s=' + searchTerm);

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.Search.length; i++) {

            movieResult.push(data.Search[i]);
            movieCounter++;

            if (movieCounter === 10) {
                break;
            }
        }

        return movieResult;
    }
};



// async function createMovie(movieData) {
//     const moviesCollection = await movies();
//     const movie = await moviesCollection.find({}).toArray();
//     // for(var i = 0; i < movie.length; i++){
//     //   if(movie[i].name === movieData.name){
//     //     throw "Movie already exists in DB"
//     //   }
//     // }

//     let newMovie = {
//         name: movieData
//     };

//     const insertInfo = await moviesCollection.insertOne(newMovie);
//     const newId = insertInfo.insertedId.toString();

//     const movieeee = await this.get(newId);
//     movieeee._id = movieeee._id.toString();

//     return movieeee;
// }

async function searchMovieByAPI(searchTerm) {
    validation.validateString("searchTerm", searchTerm);

    const {
        data
    } = await axios.get('https://www.omdbapi.com/?apikey=58db0176&s=' + searchTerm);

    let movieResult = [];
    let movieCounter = 0;
    for (var i = 0; i < data.Search.length; i++) {

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
    ...exportedMethods,
    // createMovie
};