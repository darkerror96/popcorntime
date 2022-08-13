const express = require("express");
const router = express.Router();

router.get('/', async (req, res) => {
    if(req.session.user){
        req.session.destroy();
        res.render('users/logout', {title: "Logged Out"});
    }else{
        res.redirect('/');
    }
});

module.exports = router;