const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
const { ObjectId } = require("mongodb");

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

module.exports = exportedMethods;
