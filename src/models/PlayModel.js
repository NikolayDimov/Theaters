const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const playSchema = new Schema({
    title: { type: String, required: [true, 'Title is required'] },
    description: { type: String, required: true, minlength: [10, 'Description must be at least 10 characters long'], maxLength: [250, 'Description must be not more than 250 characters long'] },
    imageUrl: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    isPublic: { type: Boolean, default: false },
    cratedAt: { type: Date, default: Date.now },
    usersLiked: { type: [ObjectId], ref: 'User', default: [] },
    owner: { type: ObjectId, ref: 'User' }
});


const Play = model('Play', playSchema);

module.exports = Play;