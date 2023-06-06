const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { getAllPlays, createPlay, getPlayById, deleteById, editPlay, likePlay, sortByLikes } = require('../services/theaterService');
const mapErrors = require('../util/mapError');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Create Theater Play', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const playData = {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        isPublic: Boolean(req.body.isPublic),
        owner: req.user._id,
    };

    try {
        await createPlay(req.user._id, playData);
        res.redirect('/');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Create Theater Play', data: playData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/', async (req, res) => {
    if(req.query.orderBy == 'likes') {
        const plays = await sortByLikes(req.query.orderBy);
        res.render('catalog', { title: 'Theater Catalog', plays });

    } else {
        const plays = await getAllPlays();
        res.render('catalog', { title: 'Theater Catalog', plays });
    }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details/', async (req, res) => {
    try {
        const currPlay = await getPlayById(req.params.id);
        // console.log(currPlay);    // see below

        // if(currCrypto.owner == req.user._id) {
        //     currCrypto.isOwner = true;
        // }
        // or
        const isOwner = currPlay.owner == req.user?._id;
        // req.user?._id -->> въпросителната е - ако има user вземи user, ако няма user върни undefined
        // currGame.owner e създателя/owner-a на Играта
        // req.user?._id e owner-a на профила 
        // req.params.gameId -->> e _id на криптото


        // проверка за харесвания
        // currPlay.liked = req.user && currPlay.usersLiked.includes(req.user._id); 
        // .....or.....
        // const isLiked = currPlay.usersLiked?.includes(req.user?._id);
        const isLiked = currPlay.usersLiked.find(u => u._id == req.user._id);
        // ако нямаме isLiked ще даде undefined и грешка -->> TypeError: Cannot read properties of undefined (reading 'some')
        // затова на usersLiked поставяме ?
        // .....or.....
        // const isLiked = currPlay.usersLiked.length;


        res.render('details', { title: 'Theater Play Details', currPlay, isOwner, isLiked });

    } catch (err) {
        console.log(err.message);
        res.redirect('/404');
    }

});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });




router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    try {
        const currPlay = await getPlayById(req.params.id);
        //  console.log(currPlay);
        //  {
        //     _id: new ObjectId("647a04423f099a2eb38db69a"),
        //     title: "Who's Afraid of Virginia Woolf?",
        //     description: "Who's Afraid of Virginia Woolf? \r\nby Edward Albee",      
        //     imageUrl: 'https://media.timeout.com/images/103727744/380/285/image.jpg',
        //     isPublic: false,
        //     owner: new ObjectId("6479de10d91dcc795698c96e"),
        //     userLiked: [],
        //     __v: 0
        // }

        if (currPlay.owner != req.user._id) {
            throw new Error('Cannot edit Play that you are not owner');
        }

        res.render('edit', { title: 'Edit Play', currPlay });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }


    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const playId = req.params.id;

    const currPlay = {
        _id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        isPublic: Boolean(req.body.isPublic),
    };


    try {
        const currPlayForOwner = await getPlayById(req.params.id);
        if (currPlayForOwner.owner != req.user._id) {
            throw new Error('Cannot edit Play that you are not owner');
        }

        await editPlay(playId, currPlay);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        // editedGameData._id = gameId;  -->> служи да подадем id в edit.hs, но там диретно трием action=""
        // editedGameData._id = gameId;
        res.render('edit', { title: 'Edit Theater Play', currPlay, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    try {
        const currPlay = await getPlayById(req.params.id);
        
        if (currPlay.owner != req.user._id) {
            throw new Error('Cannot delete Play that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }

});


router.get('/catalog/:id/like', isAuth, async (req, res) => {
    try {
        const currPlay = await getPlayById(req.params.id);
        
        if (currPlay.owner == req.user._id) {
            throw new Error('Cannot like your own Play!');
        }

        await likePlay(req.params.id, req.user._id);
        res.redirect(`/catalog/${req.params.id}/details`);
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});


// router.get('/search', isAuth, async (req, res) => {
//     const { cryptoName, paymentMethod } = req.query;
//     const crypto = await search(cryptoName, paymentMethod);

//     const paymentMethodsMap = {
//         "crypto-wallet": 'Crypto Wallet',
//         "credit-card": 'Credit Card',
//         "debit-card": 'Debit Card',
//         "paypal": 'PayPal',
//     };

//     const paymentMethods = Object.keys(paymentMethodsMap).map(key => ({
//         value: key, 
//         label: paymentMethodsMap[key] ,
//         isSelected: crypto.paymentMethod == key
//     }));


//     res.render('search', { crypto, paymentMethods });
// });




module.exports = router;






// console.log(currGame);;
// {
//     _id: new ObjectId("647652253addd63fbb6d6f07"),
//     platform: 'PS5',
//     name: 'Mortal Kombat',
//     image: 'http://localhost:3000/static/images/mortal-kombat.png',
//     price: 250,
//     genre: 'Action',
//     description: 'Mortal Kombat fight game for adults',
//     owner: new ObjectId("6473c444cd9aad92fcefb5e3"),
//     __v: 0
// }


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }