const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: { 
        type: String,
        unique: true 
    },
    roll: {
        type: String
    },
    interest1: {
        type: String
    },
    interest2: {
        type: String
    },
    interest3: {
        type: String
    },
    interest4: {
        type: String
    },
    interest5: {
        type: String
    },
    Name: {
        type: String
    },
    DP :{
        type: String
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;