var express = require('express');
const multer = require("multer");
const mongoose = require("mongoose");
var router = express.Router();
const Project = require('../models/projects');
const Skills = require('../models/skill');
const Qualification = require('../models/qualification');
const userInfo = require("../models/userinfo");
const db = require("../database/db");
const jwt = require("jsonwebtoken")
const session = require('express-session');
// const {check,validationResult}=require('express-validator');
require("../authStrategies/localStrategy")
const passport = require("passport");
const MongoStore = require('connect-mongo');
const authMiddelware = require("../middelware/authMiddelware")
const qustMiddelware = require("../middelware/qustMiddelware")


router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},
  store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/dashbord" })
}));

router.use(passport.initialize())
router.use(passport.session())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg")
      cb(null, "public/images/");
    // else if (file.mimetype == "application/pdf") cb(null, "public/pdf/");
   
  },
  filename: (req, file, cb) => {
    var extension = file.originalname.split(".");
    var ext = extension[extension.length - 1];

    //var uploaded_file_name =Date.now() + '-' + Math.round(Math.random() * 1E9)+file.originalname;
    var uploaded_file_name =
      file.fieldname +
      "-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "." +
      ext;

    cb(null, uploaded_file_name);
  },
});

const upload = multer({
  storage: storage,

  fileFilter: (req, file, callback) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg"
      // file.mimetype == "application/pdf"
    ) {
      callback(null, true);
    } else callback(null, false);
  },
  limits: 1024 * 1024 * 5,
});

// isAuthenticated = (req,res,next)=>{
//   if (req.isAuthenticated) {
//     return next();
    
//   }
//   res.redirect('/login');
// }
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
//login
// router.get('/login', function(req, res, next) {
//   var massagesError=req.body;
  
//   res.render('login', { massages : massagesError });
// });
// router.post('/login',[
//   check('email').not().isEmpty().withMessage('please enter your email'),
//   check('email').isEmail().withMessage('please enter valid email'),
//   check('password').not().isEmpty().withMessage('please enter your password'),
//   check('password').isLength({min : 5}).withMessage('password must be more than 5 char'),

// ],(req,res,next)=>{
//   const errors=validationResult(req);
//   if (! errors.isEmpty()) {
//     var validationMassages=[];
//     for (let i = 0; i < errors.errors.length; i++) {
//       validationMassages.push(errors.errors[i].msg)
      
//     }
//     res.redirect('/login');
//     console.log(validationMassages);
//     return;
//   }
//   next();

// },passport.authenticate('local-login',{
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true,

// }));

// // sign up form 
// router.get('/signIn', (req,res)=> {
//   res.render('user/signIn', {
//       error: req.flash('error')
//   })
// })

// // sign up post request

// router.post('/signIn',
// passport.authenticate('local-signup', {
//   successRedirect: '/',
//     failureRedirect: '/signIn',
//     failureFlash: true 
// }))
router.get("/login", qustMiddelware, (req, res, next)=>{
  res.render("login")
})
router.post("/login", qustMiddelware, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res)=>{
  return res.render("login")
})

router.get('/homepage', authMiddelware,(req, res, next)=>{
  res.send(`welcome ${req.user.email}`)
})



/* GET home page. */

let project_count = 0,
    skill_count = 0,
    qualif_count = 0,
    user_info,
    skill_info;
router.get("/", (req, res, next)=>{
  req.session.views = (req.session.views || 0) + 1
  console.log('user: ', req.user)
  Project.count({}, (err, result)=>{
    project_count = result;
  });
  Skills.count({}, (err, result)=>{
    skill_count = result;
  });
  Qualification.count({}, (err, result)=>{
    qualif_count =result;
  });

  Project.find().then((p)=>{
    project_info = p
  })
  userInfo.find().then((u)=>{
    user_info = u
  })
  Skills.find().then((s)=>{
    skill_info = s
  })
  Project.find().then((reslut)=>{
    res.render("index",{
      title: "DASHBORD", 
      project: project_count,
      skills: skill_count,
      qualification: qualif_count,
      projects: reslut,
      user: user_info,
      skill: skill_info 
    })
  });
  
})
let results ;
userInfo.findOne({}).then((selectuser)=>{
  results = selectuser
})

const JWT_SECRET = 'some super secret';

router.get("/forgot-password", (req, res, next)=>{
  res.render("forgot-password")
})

router.post("/forgot-password", (req, res, next)=>{
  
  

    const {email} = req.body;
    console.log(results.email)
  if(email !== results.email){
    res.send("user not exists")
    return;
  }
  const secret = JWT_SECRET + results.password
  const payload ={
    email: results.email,
    id: results._id
  }
  const token = jwt.sign(payload, secret, {expiresIn: '15m'})
  const link = `http://localhost:3000/reset-password/${results._id}/${token}`;
  res.render("passwordChack", { links: link})
  
})

router.get("/reset-password/:_id/:token", (req, res, next)=>{
  const {id, token} = req.params
  
  const secret = JWT_SECRET + results.password

  try{
    const payload = jwt.verify(token, secret)
    res.render('reset-password', {email: results.email})
  }catch(err){
    console.log(ree.message)
    res.send(err.message)
  }
})

router.post("/reset-password", (req, res, next)=>{
  var item ={
    password: req.body.password
  }
  var id = req.params.id;
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		assert.equal(null, err);
		console.log("item updated");
    res.redirect('/')
	})
  
})

router.post('/update_profile', function(req, res, next){
	var item = {
		username: req.body.name,
		email: req.body.email,
	};
	var id = req.body.id;
	userInfo.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		console.log("item updated");
	})
  res.redirect('/')
})

router.get('/projects', function(req, res, next) {
    Project.find().then((reslut)=>{
    res.render('projects', {title: 'Project',projects: reslut});
  });
});

router.post('/add_project', upload.single('image'), (req, res) =>{
  const project = new Project({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    link: req.body.link,
    image: req.file.filename,
  })
  project.save();
  res.redirect('/projects');
});

router.post('/update_project', function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
		link: req.body.link,
	};
	var id = req.body.id;
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		console.log("item updated");
	})
  res.redirect('/projects')
})

router.get('/isActive_project/:id', function(req, res, next) {
  var item ={isActive: false}	
  var id= req.params.id
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		res.redirect('/projects')
	})
})
router.get('/notActive_project/:id', function(req, res, next) {
  var item ={isActive: true}	
  var id= req.params.id
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		res.redirect('/projects')
	})
})


// Skills Part 

router.get("/skills", (req, res, next)=>{
  Skills.find().then((result) =>{
    res.render("skills", {title: "Skills", skills: result})
  })
})


router.post('/skills/add_skill', upload.single('image'), (req, res) =>{
  // console.log(req.file.filename);
  const skill = new Skills({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    imageskill: req.file.filename
  })
  skill.save();
  res.redirect("/skills")
});


router.post('/update_skill', function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
	};
	var id = req.body.id;
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		console.log("item updated");
	})
  res.redirect("/skills")
})

router.get('/isActive_skill/:id', function(req, res, next) {
  var item ={isActive: false}	
  var id= req.params.id
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		res.redirect('/skills')
	})
})
router.get('/notActive_skill/:id', function(req, res, next) {
  var item ={isActive: true}	
  var id= req.params.id
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		res.redirect('/skills')
	})
})


// Start qualification

router.get("/qualification", (req, res, next)=>{
  Qualification.find().then((result) =>{
    res.render("qualification", {title: "Qualifications", qualification: result})
  })
})

router.post('/add_qualifi', (req, res) =>{
  const qualification = new Qualification({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    yearStart: req.body.yearStart,
    yearEnd: req.body.yearEnd
  })
  qualification.save();
  res.render('qualification', {title: "qualification"});
});

router.post('/update_qualifi', function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
		yearStart: req.body.yearStart,
		yearEnd: req.body.yearEnd
	};
	var id = req.body.id;
	Qualification.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		console.log("item updated");
	})
  res.render('qualification', {title: "qualification"})
})


router.get('/delete_qualif/:id', function(req, res, next) {	
	Qualification.deleteOne({"_id": req.params.id}, function(err, result) {
		if (err) {
			console.log('error' ,err)
			res.render('/index')
		} else {
			res.redirect('/index')
		}
	})
})

module.exports = router;
