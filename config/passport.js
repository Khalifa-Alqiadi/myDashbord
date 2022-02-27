const passport = require('passport');
const localstrategy=require('passport-local').Strategy;
const User = require('../models/userinfo');
passport.serializeUser((user,done)=>{
    return done(null,user.id);
});
// saving user object in the session

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
//register user
passport.use('local-signup',new localstrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,
},(req,email,password,done)=>{
    console.log(req.body);
    if (req.body.password != req.body.passwordconfirm) {
        return done(null,false,req.flash('error','password do not match')) 
    }
    else
    {
        User.findOne({email:email},(err,user)=>{
            if (err) {
                return done(err)
                
            }
            if (user) {
                return done(null,false,req.flash('error','email already used'))                
            }
            if (!user) {
                let newUser=new User();
                newUser.email=req.body.email;
                newUser.password=newUser.hashpassword(req.body.password);
                newUser.avatar='profile-img.png';
                newUser.save((err,user)=>{
                    if (!err) {
                        return done(null,user,req.flash('success','user add'))

                        
                    }
                    else
                    {
                        console.log(err);
                    }
                })
                
            }
        })
    }
    console.log(req.body)

}))

//login
passport.use('local-login',new localstrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,


} ,(req,email,password,done)=>{
    User.findOne({email:email},(err,user)=>{
        if (err) {
            return done(err);
            
        }
        if (! user) {
            return done(null,false,req.flash('loginError','this user not found'));
            
        }
        if (! user.comparePassword(password)) {
            return done(null,false,req.flash('loginError','worning password'))
            
        }
        return done(null,user)
    })


}))