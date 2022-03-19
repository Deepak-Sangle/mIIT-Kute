const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body :{
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: false
    }
});

mongoose.model("Interest", interestSchema);