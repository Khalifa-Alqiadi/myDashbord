const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aboutSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description1:{
        type:String,
        required:true
    },
    description2:{
        type:String,
    },
    description2:{
        type:String,
    },
    cv:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isActive:{
        type:String,
        default:true
    }
})

const about = module.exports = mongoose.model('about', aboutSchema);