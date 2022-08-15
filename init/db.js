require('dotenv').config();
const users = require("../data/users");
const movies = require("../data/movies");
const axios = require("axios");
const mongoConnection = require("../config/mongoConnection");

async function main() {
    // Add Dummy User Account
    const user = await addUserAccount(process.env.DUMMY_USER_EMAIL, process.env.DUMMY_USER_PWD_HASHED, process.env.DUMMY_USER_USERNAME, "John", "Doe", "user");
    console.log(`Dummy User created : ${user}`);

    // Add Dummy Admin Account
    const admin = await addUserAccount(process.env.DUMMY_ADMIN_EMAIL, process.env.DUMMY_ADMIN_PWD_HASHED, process.env.DUMMY_ADMIN_USERNAME, "Admin", "Geek", "admin");
    console.log(`Dummy Admin created : ${admin}`);

    // Add Movies - Read search term list from .env file
    const movieSearchTermList = process.env.MOVIE_SEARCH_TERM_LIST;
    for (let searchTerm of movieSearchTermList.split(",")) {
        const movies = await searchMovieByAPI(searchTerm.trim());
        for (let movie of movies) {
            let m = await getMovieByIMDbID(movie.imdbID);

            let r = new Date(m.Released);
            let rt = r.getFullYear() + "-";

            if ((r.getMonth() + 1).toString().length == 1) {
                rt += "0" + (r.getMonth() + 1) + "-";
            } else {
                rt += (r.getMonth() + 1) + "-";
            }

            if (r.getDate().toString().length == 1) {
                rt += "0" + r.getDate();
            } else {
                rt += r.getDate();
            }

            await addMovie(m.Title.trim(), m.Plot.trim(), m.Genre.split(", "), m.Runtime.split(" min")[0], m.Poster.trim(), rt, m.Actors.split(", "), m.Director.split(", "));
        }
    }

    const movie = await movies.getAllMovies();
    console.log(`Total Movies in DB : ${movie.length}`);

    // Close mongodb connection explicitly
    mongoConnection.closeConnection();
}

async function addUserAccount(email, hashedPassword, username, first_name, last_name, role) {
    try {
        const newUser = {
            email: email,
            username: username,
            password: hashedPassword,
            first_name: first_name,
            last_name: last_name,
            birthday: "",
            role: role,
            watch_list: [],
            preferences: {
                liked_genres: ["Action", "Adventure", "Horror", "Sci-Fi"],
                disliked_genres: [],
                liked_movies: [],
                disliked_movies: [],
                liked_actors: ["Chris Hemsworth", "Morgan Freeman", "Scarlett Johansson", "Tom Hanks"],
                disliked_actors: [],
                liked_directors: ["Christopher Nolan", "Jon Favreau"],
                disliked_directors: [],
            },
        };

        return await users.insertUser(newUser);
    } catch (e) {
        console.log(e);
    }
}

async function addMovie(name, summary, genres, duration, poster, release_date, cast, director) {
    try {
        return await movies.addMovie(name, summary, genres, duration, poster, release_date, cast, director);
    } catch (e) {
        // console.log(e);
    }
}

async function searchMovieByAPI(searchTerm) {
    const {
        data
    } = await axios.get(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&type=movie&s=${searchTerm}`);

    let movieResult = [];
    for (var i = 0; i < data.Search.length; i++) {
        movieResult.push(data.Search[i]);
    }

    return movieResult;
}

async function getMovieByIMDbID(imdbID) {
    const {
        data
    } = await axios.get(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&type=movie&i=${imdbID}`);

    return data;
}

main();