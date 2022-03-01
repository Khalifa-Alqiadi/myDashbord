const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/userinfo");

passport.use(new LocalStrategy({usernameField: 'email'},
    async (email, password, done) => {
        try {
            const user = await User.findOne({email})
            console.log("user", password)
            if(!user) done(null, false)
            if(await user.checkPassword(password)) return done(null, user)
            done(null, false) 
        } catch (e) {
            done(e);
        }
    }
));


passport.serializeUser( (user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (_id, cb) => {
    try{
        const user = await User.findOne({_id})
        cb(null, user)
    }catch(e){
        cb(e)
    }
});

module.exports = User