const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const projectSchema = new Schema({
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
    link:{
        type:String,
        required: true
    },
    repositories:{
        type:String,
        required: true
    },
    image:{
        type:String,
        required: true
    },
    isActive:{
        type:String,
        default: true
    }
});

const Project = module.exports = mongoose.model('Projects', projectSchema);