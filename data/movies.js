const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
const { ObjectId } = require("mongodb");
const axios = require("axios");
const validation = require('./validation');

const exportedMethods = {
  async getMovieById(id) {
    const moviesCollection = await movies();
    const movie = await moviesCollection.findOne({ _id: ObjectId(id) });
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
    const updateInfo = await moviesCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          reviews: reviews,
          avg_rating: newAverage,
        },
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
  },
};

async function searchMovie(searchTerm) {
  console.log("im reaching movies search")
  validation.validateString("searchTerm", searchTerm);

  const data = await searchMovieAPI(searchTerm);
  
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

async function searchMovieAPI(searchTerm){
  const {data} = await axios.get('https://www.omdbapi.com/?apikey=58db0176&s=' + searchTerm);
  return data;
}

module.exports = {
  exportedMethods,
  searchMovie,
  searchMovieAPI,
  getMovie,
  getMovieAPI
};
