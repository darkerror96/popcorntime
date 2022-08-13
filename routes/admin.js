const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('users/admin', {title: "Admin"});
});

module.exports = router;