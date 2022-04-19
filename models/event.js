const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location :{
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    members:{
        type: Array,
        default: []
    },
    interest:{
        type: String,
        required: true
    },
    startAt: {
        type: String,
        required: true
    },
    endAt: {
        type: String,
        required: true
    },
    img :{
        type: String
    }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event