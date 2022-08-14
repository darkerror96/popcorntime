const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
const {
    ObjectId
} = require("mongodb");
const axios = require("axios");
const validation = require("../utils/validation");

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
        searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");
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

        searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");
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
        searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");
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
        searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");
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
        searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");

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
        name = validation.checkStringNoRegex(name, "Movie Name");
        summary = validation.checkStringNoRegex(summary, "Summary");
        genres = validation.checkStringArray(genres, "Genre");
        duration = validation.checkNumber(duration, "Duration", 1, 5000);
        poster = validation.checkPosterFilePath(poster, "Poster file path");
        release_date = validation.checkDate(release_date, "Release Date");
        cast = validation.checkStringArray(cast, "Cast");
        director = validation.checkStringArray(director, "Director");

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
        id = validation.checkId(id, 'Movie ID');

        const moviesCollection = await movies();
        const deletionInfo = await moviesCollection.deleteOne({
            _id: ObjectId(id)
        });

        if (deletionInfo.deletedCount === 0) throw `Could not delete movie with id of ${id}`;
        return true;
    },

    async updateMovie(id, name, summary, genres, duration, poster, release_date, cast, director, avg_rating, reviews) {
        id = validation.checkId(id, 'Movie ID');

        name = validation.checkStringNoRegex(name, "Movie Name");
        summary = validation.checkStringNoRegex(summary, "Summary");
        genres = validation.checkStringArray(genres, "Genre");
        duration = validation.checkNumber(duration, "Duration", 1, 5000);
        poster = validation.checkPosterFilePath(poster, "Poster file path");
        release_date = validation.checkDate(release_date, "Release Date");
        cast = validation.checkStringArray(cast, "Cast");
        director = validation.checkStringArray(director, "Director");
        avg_rating = validation.checkNumber(avg_rating, "Avg Rating", 1, 10);
        reviews = validation.checkReviews(reviews, "Reviews");

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
    searchTerm = validation.checkStringNoRegex(searchTerm, "searchTerm");

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

    imdbID = validation.checkStringNoRegex(imdbID, "imdbID");

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