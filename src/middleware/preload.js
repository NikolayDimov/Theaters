// FOR SESSION ONLY
// COOKIES ONLY

// TODO replace with actual service
const tripService = require('../services/catalogService');


function preload(populate) {
    return async function(req, res, next) {
        const id = req.params.id;

        if(populate) {
            res.locals.crypto = await tripService.getCryptoAndUsers(id);
        } else {
            // TODO change property name (trip) to match collection
            res.locals.crypto = await tripService.getCryptoById(id);
        }

        next();
    };
}

module.exports = preload;



// Поставяме променлива populate на функцията preload и ако е true ще викнем различна функция от сървиса getTripById(id)
// В сървиса ще има 2 функции 
// - една  която го популейтва - getTripAndUsers(id)
// - една която го зарежда - getTripById(id)
// И ако на populate е подадено true ще винкем функция getTripAndUsers(id)
// Ако е false ще викнем фунция getTripById(id), която зарежда само данните

// в controllers -> homeController -> на preload добавяме true ->
// в router.get('/catalog/:id', preload(true), (req, res) => {
//     res.render('details', { title: 'Trip Details' });
// });