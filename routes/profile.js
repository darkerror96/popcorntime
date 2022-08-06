const express = require('express')
const router = express.Router()
const users = require('../data/users')

router.get('/', async (req, res) => {
  // TODO Stop non-users from accessing this, and remove this hard-coding
  req.session = {}
  req.session.user = 'john_doe'
  if (true || (req.session && req.session.user)) {
    const user = await users.getUsername(req.session.user)
    res.render('users/profile', {
      title: 'Profile',
      first_name: user.first_name,
      watch_list: user.watch_list,
      preferences: user.preferences
    })
  } else {
    //TODO Add a section to display errors in the signup page
    res.status(403).render('../views/users/signup', {
      message: 'You need to be signed up to access this page'
    })
    return
  }
})

module.exports = router
