const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");

const exportedMethods = {
    async getUsername(username){
        const usersCollection = await users();
        const user = await usersCollection.findOne({username: username});
        return user.username;
    },
    async insertUser(user){
        const usersCollection = await users();
        const newUser = await usersCollection.insertOne(user);
        return newUser.insertedId;
    },
    async getEmail(email){
        const usersCollection = await users();
        const user = await usersCollection.findOne({email: email});
        return user.email;
    }
}

module.exports = exportedMethods;