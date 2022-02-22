const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const qualification = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    yearStart:{
        type:String,
        required: true
    },
    yearEnd:{
        type:String,
        required: true
    }
});

const Qualification = module.exports = mongoose.model('Qualifications', qualification);