const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const mySkills = new Schema({
    id: {
        type:String,
        required: true
    },
    name: {
        type:String,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    imageskill: {
        type:String,
        required: true
    },
    isActive: {
        type:String,
        default: true
    },
})

const Skills = module.exports = mongoose.model('Skills', mySkills);