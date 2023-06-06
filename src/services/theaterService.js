const Play = require('../models/PlayModel');
// const { eventNames } = require('../models/User');


async function getAllPlays() {
    return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

// async function getGameByUser(userId) {
//     return Game.find({ owner: userId }).lean();
// }

async function getPlayById(playId) {
    return await Play.findById(playId).populate('usersLiked').lean();
    // .populate('usersLiked') -->> когато искаме да извадим масива с usersLiked (кои id-та са харесали пиесата)
}

// async function getGameAndUsers(id) {
//     return Game.findById(id).populate('owner').lean();
// }

async function createPlay(ownerId, playData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${playData.title}$`, 'i');
    const existing = await Play.findOne({ title: { $regex: pattern } });

    if (existing) {
        throw new Error('A theater play with this name already exists');
    }

    const result = new Play(playData);
    await result.save();
    return result;
}

async function editPlay(playId, editedPlayData) {
    const existing = await Play.findById(playId);

    existing.title = editedPlayData.title;
    existing.description = editedPlayData.description;
    existing.imageUrl = editedPlayData.imageUrl;
    existing.isPublic = Boolean(editedPlayData.isPublic);

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(playId) {
    return Play.findByIdAndDelete(playId);
}



async function likePlay(playId, userId) {
    const existing = await Play.findById(playId);
    existing.usersLiked.push(userId);

    // Друг начин за увеличаване на Likes 
    // но за целта ни трябва в PlayModel пропърти -- likes: { type: Nimber }
    // след което в тази функция записваме:
    // existing.usersLiked.push(userId);
    // existing.likes++;

    return existing.save();
}


async function sortByLikes(orderBy) {
    return Play.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
}



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }

// console.log(game);
// {
//     buyers: [],
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

// console.log(userId)
// 6477a39de63159e157a32fa6  --> George




// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }



module.exports = {
    getAllPlays,
    createPlay,
    getPlayById,
    deleteById,
    editPlay,
    likePlay,
    sortByLikes
};