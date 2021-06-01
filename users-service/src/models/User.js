const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: [true, "can't be blank"], unique: true, match: [/^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/, 'invalid username'] },
    password: { type: String, required: [true, "can't be blank"] },
    access: {
        token: [String],
        validation_link: [String],
        forgetpass_link: [String],
    },
    active: { type: Boolean, default: true, required: [true, "can't be blank"] },
    picture: { type: String },
    friends: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    email: {
        value: { type: String, required: [true, "can't be blank"], unique: true, match: [/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/, 'invalid email'] },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'Private', required: [true, "can't be blank"] },
    },
    birthdate: {
        value: { type: Date },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'onlyForFriends', required: [true, "can't be blank"] },
    },
    phone: {
        value: { type: String },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'onlyForFriends', required: [true, "can't be blank"] },
    },
    country: {
        value: { type: String },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'Public', required: [true, "can't be blank"] },
    },
    gender: {
        value: { type: String },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'onlyForFriends', required: [true, "can't be blank"] },
    },
    musics_preferences: {
        value: { type: [String] },
        visibility: { type: ['Public', 'onlyForFriends', 'Private'], default: 'Public', required: [true, "can't be blank"] },
    },
}, {timestamps: true});

module.exports = mongoose.model('users', userSchema);