const homeController = require('express').Router();

// const { isAuth } = require('../middleware/userSession');
// const preload = require('../middleware/preload');    -->> for SESSION


//TODO replace with real controller by assignment
homeController.get('/', (req, res) => {
    // console.log(req.user);
    res.render('/', {
        title: 'Home Page',
    });
});

module.exports = homeController;


