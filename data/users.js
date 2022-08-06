const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");

const exportedMethods = {
    async getUser(username){
        const usersCollection = await users();
        const user = await usersCollection.findOne({username: username});
        return user;
    },
    async getUserByEmail(email){
        const usersCollection = await users();
        const user = await usersCollection.findOne({email: email});
        return user;
    },
    async insertUser(user){
        const usersCollection = await users();
        const newUser = await usersCollection.insertOne(user);
        return newUser.insertedId;
    }
}

module.exports = exportedMethods;