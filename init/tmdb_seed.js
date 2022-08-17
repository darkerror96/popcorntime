const tmdb_movies = require("./tmdb_movies");
const movies = require("../data/movies");

async function main() {
  for (movie in tmdb_movies) {
    let name = tmdb_movies[movie].title;
    let summary = tmdb_movies[movie].overview;
    let genres = tmdb_movies[movie].genres;
    let duration = tmdb_movies[movie].runtime;
    let poster =
      "https://image.tmdb.org/t/p/w300_and_h450_bestv2" +
      tmdb_movies[movie].poster_path;
    let release_date = tmdb_movies[movie].release_date;
    let cast = [];
    for (let i = 0; i < tmdb_movies[movie].cast.length; i++) {
      cast.push(tmdb_movies[movie].cast[i].name);
    }
    let director = [];
    for (let i = 0; i < tmdb_movies[movie].directors.length; i++) {
      director.push(tmdb_movies[movie].directors[i].name);
    }
    try {
      await movies.addMovie(
        name,
        summary,
        genres,
        duration,
        poster,
        release_date,
        cast,
        director
      );
    } catch (err) {
      console.log(err);
    }
  }
}

main();
