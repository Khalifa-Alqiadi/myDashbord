const mongoose = require('mongoose');
const bcrypt = require("bcrypt")
const Schema=mongoose.Schema;

const userInfo = new Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    image:{
        type:String,
        required: true
    }
});
userInfo.pre('save', async function(next) {
  
    if (!this.isModified('password')) return next();
  
    this.password = await bcrypt.hash(this.password, 10)
    next();
});

userInfo.method.checkPassword = async function(password){
    const result = await bcrypt.compare(password, this.password)
    return result
}
const userInfos = module.exports = mongoose.model('userinfos', userInfo);