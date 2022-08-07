const express = require('express')
const router = express.Router()
const users = require('../data/users')
const movies = require('../data/movies')

router.get('/', async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  req.session = {}
  req.session.user = 'john_doe'
  if (true || (req.session && req.session.user)) {
    const user = await users.getUsername(req.session.user)
    let movieIds = []
    pushToArray(movieIds, user.watch_list)
    pushToArray(movieIds, user.preferences.liked_movies)
    pushToArray(movieIds, user.preferences.disliked_movies)

    const moviesResult = await movies.getMoviesById(movieIds)
    let moviesResultMap = {}
    moviesResult.forEach(movie => {
      moviesResultMap[movie._id.toString()] = movie
    })

    let watchList = []
    user.watch_list.map(movie => {
      watchList.push(moviesResultMap[movie])
    })
    let likedMovies = []
    user.preferences.liked_movies.map(movie => {
      likedMovies.push(moviesResultMap[movie])
    })
    let dislikedMovies = []
    user.preferences.disliked_movies.map(movie => {
      dislikedMovies.push(moviesResultMap[movie])
    })

    res.render('users/profile', {
      title: 'Profile',
      first_name: user.first_name,
      preferences: user.preferences,
      watchList: watchList,
      likedMovies: likedMovies,
      dislikedMovies: dislikedMovies
    })
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render('../views/users/signup', {
      message: 'You need to be signed up to access this page'
    })
    return
  }
})

function pushToArray (targetArray, inputArray) {
  if (inputArray) {
    inputArray.map(input => targetArray.push(input))
  }
}

module.exports = router
