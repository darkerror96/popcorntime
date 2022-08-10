const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");

const exportedMethods = {
  async getUsername(username) {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ username: username });
    return user;
  },
  async getUserById(id) {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: ObjectId(id) });
    return user;
  },
  async insertUser(user) {
    const usersCollection = await users();
    const newUser = await usersCollection.insertOne(user);
    return newUser.insertedId;
  },
  async getEmail(email) {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: email });
    return user;
  },
  async getUsersById(idArray) {
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
    const usersCollection = await users();
    const usersResult = await usersCollection
      .find({
        _id: {
          $in: inputArray,
        },
      })
      .toArray();
    return usersResult;
  },
  async addToWatchList(id, movieId) {
    const usersCollection = await users();
    const updateInfo = await usersCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $addToSet: {
          watch_list: movieId,
        },
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
  },
  async updatePreferences(id, updatedPreferences) {
    const usersCollection = await users();
    const updateInfo = await usersCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          preferences: updatedPreferences,
        },
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
  },
  async removeFromWatchList(id, movieId) {
    const usersCollection = await users();
    const updateInfo = await usersCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $pull: {
          watch_list: movieId,
        },
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
  }
};

module.exports = exportedMethods;
