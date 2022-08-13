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
        searchTerm = searchTerm.toLowerCase();

        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name.toLowerCase().replace(/\s/g, '').includes(searchTerm) && data[i].name !== undefined) {

                movieResult.push(data[i]);
                movieCounter++;
                if (movieCounter === 10) {
                    break;
                }
            }

        }
        if (movieResult.length == 0) {
            throw "No results found for " + searchTerm;
        }

        return movieResult;
    },
    async searchCast(searchTerm) {

        validation.validateString("searchTerm", searchTerm);
        searchTerm = searchTerm.toLowerCase();
        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {

            if (data[i].cast !== undefined) {
                for (var j = 0; j < data[i].cast.length; j++) {
                    if (data[i].cast[j].toLowerCase().replace(/\s/g, '').includes(searchTerm)) {
                        movieResult.push(data[i]);
                        movieCounter++;
                        if (movieCounter === 10) {
                            break;
                        }
                    }
                }
            }
        }
        if (movieResult.length == 0) {
            throw "No results found for " + searchTerm;
        }


        return movieResult;
    },
    async searchDirector(searchTerm) {
        validation.validateString("searchTerm", searchTerm);
        searchTerm = searchTerm.toLowerCase();
        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();
        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].director !== undefined) {
                for (var j = 0; j < data[i].director.length; j++) {
                    if (data[i].director[j].toLowerCase().replace(/\s/g, '').includes(searchTerm)) {
                        movieResult.push(data[i]);
                        movieCounter++;
                        if (movieCounter === 10) {
                            break;
                        }
                    }
                }
            }
        }
        if (movieResult.length == 0) {
            throw "No results found for " + searchTerm;
        }

        return movieResult;
    },
    async searchYear(searchTerm) {
        validation.validateString("searchTerm", searchTerm);
        searchTerm = searchTerm.toLowerCase();

        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].release_date.toLowerCase().replace(/-/g, '').slice(0, 4).includes(searchTerm) && data[i].release_date !== undefined) {

                movieResult.push(data[i]);
                movieCounter++;
                if (movieCounter === 10) {
                    break;
                }
            }

        }
        if (movieResult.length == 0) {
            throw "No results found for " + searchTerm;
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
    },

    async addMovie(name, summary, genres, duration, poster, release_date, cast, director) {
        validation.validateMovieData(name, summary, genres, duration, release_date, cast, director);
        validation.validatePosterFilePath("Poster", poster);

        const newMovie = {
            name: name,
            summary: summary,
            genres: genres,
            duration: duration,
            poster: poster,
            release_date: release_date,
            cast: cast,
            director: director,
            avg_rating: 0,
            reviews: []
        };

        const moviesCollection = await movies();
        const newInsertInformation = await moviesCollection.insertOne(newMovie);
        if (!newInsertInformation.insertedId) throw 'Insert failed!';

        return this.getMovieById(newInsertInformation.insertedId.toString());
    },

    async removeMovie(id) {
        validation.validateID('id', id);
        id = id.trim();

        const moviesCollection = await movies();
        const deletionInfo = await moviesCollection.deleteOne({
            _id: ObjectId(id)
        });

        if (deletionInfo.deletedCount === 0) throw `Could not delete movie with id of ${id}`;
        return true;
    },

    async updateMovie(id, name, summary, genres, duration, poster, release_date, cast, director, avg_rating, reviews) {
        validation.validateID('id', id);
        id = id.trim();

        validation.validateMovieData(name, summary, genres, duration, release_date, cast, director);
        validation.validatePosterFilePath("Poster", poster);
        validation.validateAvgRating("Avg Rating", avg_rating);
        validation.validateReviews("Reviews", reviews);

        const updatedMovie = {
            name: name,
            summary: summary,
            genres: genres,
            duration: duration,
            poster: poster,
            release_date: release_date,
            cast: cast,
            director: director,
            avg_rating: avg_rating,
            reviews: reviews
        };

        const moviesCollection = await movies();
        const updateInfo = await moviesCollection.updateOne({
            _id: ObjectId(id)
        }, {
            $set: updatedMovie
        });

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
        return this.getMovieById(id);
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