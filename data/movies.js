const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
const {
    ObjectId
} = require("mongodb");
const axios = require("axios");
const validation = require("../utils/validation");
const {
    isValidHttpUrl
} = require("../utils/validation");

const exportedMethods = {
    async getAllMovies() {
        const moviesCollection = await movies();
        const movie = await moviesCollection.find({}).toArray();
        return movie;
    },
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

        let uniqueMovies = [];
        movieResult.forEach((c) => {
            if (!uniqueMovies.includes(c)) {
                uniqueMovies.push(c);
            }
        });

        if (uniqueMovies.length == 0) {
            throw "No results found for " + searchTerm;
        }


        return uniqueMovies;
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
        searchTerm = validation.checkNumber(searchTerm, "Year", 1850, 2023);

        const moviesCollection = await movies();
        const data = await moviesCollection.find({}).toArray();

        let movieResult = [];
        let movieCounter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].release_date !== undefined) {

                if (data[i].release_date.replace(/-/g, '').slice(0, 4).includes(searchTerm)) {
                    movieResult.push(data[i]);
                    movieCounter++;
                    if (movieCounter === 10) {
                        break;
                    }
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

    async addMovie(name, summary, genres, duration, poster, release_date, cast, director, avg_rating) {
        name = validation.checkStringNoRegex(name, "Movie Name");
        summary = validation.checkStringNoRegex(summary, "Summary");
        genres = validation.checkStringArray(genres, "Genre");
        duration = validation.checkNumber(duration, "Duration", 1, 5000);
        poster = validation.checkPosterFilePath(poster, "Poster file path");
        release_date = validation.checkDate(release_date, "Release Date");
        cast = validation.checkStringArray(cast, "Cast");
        director = validation.checkStringArray(director, "Director");

        if (avg_rating !== 0) {
            avg_rating = validation.checkNumber(avg_rating, "Rating", 1, 10);
        }

        // Add extra '/' to specify file path if poster value is not URL
        if (!isValidHttpUrl(poster)) {
            poster = "/" + poster;
        }

        const newMovie = {
            name: name,
            summary: summary,
            genres: genres,
            duration: duration,
            poster: poster,
            release_date: release_date,
            cast: cast,
            director: director,
            avg_rating: avg_rating,
            reviews: []
        };

        const moviesCollection = await movies();

        // Check for Duplicate Movies by exact name and release_date
        const movie = await moviesCollection.find({}).toArray();
        for (var i = 0; i < movie.length; i++) {
            if (movie[i].name === newMovie.name && movie[i].release_date === newMovie.release_date) {
                throw "'" + newMovie.name + "' Movie already exists in DB"
            }
        }

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

    async updateMovie(id, name, summary, genres, duration, poster, release_date, cast, director, posterUpdate) {
        id = validation.checkId(id, 'Movie ID');
        name = validation.checkStringNoRegex(name, "Movie Name");
        summary = validation.checkStringNoRegex(summary, "Summary");
        genres = validation.checkStringArray(genres, "Genre");
        duration = validation.checkNumber(duration, "Duration", 1, 5000);

        if (posterUpdate) poster = validation.checkPosterFilePath(poster, "Poster file path");

        release_date = validation.checkDate(release_date, "Release Date");
        cast = validation.checkStringArray(cast, "Cast");
        director = validation.checkStringArray(director, "Director");

        const updatedMovie = {
            name: name,
            summary: summary,
            genres: genres,
            duration: duration,
            release_date: release_date,
            cast: cast,
            director: director
        };

        if (posterUpdate) updatedMovie.poster = "/" + poster;

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