var express = require('express');
const multer = require("multer");
const mongoose = require("mongoose");
var router = express.Router();
const Project = require('../models/projects');
const Skills = require('../models/skill');
const Qualification = require('../models/qualification');
const userInfo = require("../models/userinfo");
const About = require("../models/about")
const db = require("../database/db");
const jwt = require("jsonwebtoken")
const session = require('express-session');
// const {check,validationResult}=require('express-validator');
require("../authStrategies/localStrategy")
const passport = require("passport");
const MongoStore = require('connect-mongo');
const authMiddelware = require("../middelware/authMiddelware")
const qustMiddelware = require("../middelware/qustMiddelware")
const flashs = require('connect-flash');
const flash = require('req-flash');


router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},
  store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/dashbord" })
}));

router.use(passport.initialize())
router.use(passport.session())

router.use(flash())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype)
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
    if (file.mimetype) {
      callback(null, true);
    } else callback(null, false);
  },
  limits: 1024 * 1024 * 5,
});

router.get("/login", qustMiddelware, (req, res, next)=>{
  res.render("dashboard/login")
})
router.post("/login", qustMiddelware, passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/dashboard/login'
}), (req, res)=>{
  return res.render("dashboard/login")
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
router.get("/", authMiddelware, (req, res, next)=>{
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
    res.render("dashboard/dashboard",{
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
  res.render("dashboard/forgot-password")
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
    res.render('dashboard/reset-password', {email: results.email})
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
    res.redirect('/dashboard')
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
  res.redirect('/dashboard')
})


// Start Porjects Part

router.post('/add_project', upload.single('image'), (req, res) =>{
  const project = new Project({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    link: req.body.link,
    repositories: req.body.repositories,
    image: req.file.filename,
  })
  if(!project.save()){
    req.flash('addProjectField', 'Something went wrong while add project');
  }else{
    req.flash('addProjectSuccess', 'add Project successfully')
    project.save();
  }
  res.redirect('/dashboard/projects');
});

router.post('/update_project', upload.single('image'), function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
		link: req.body.link,
		repositories: req.body.repositories,
        image: req.file.filename,
	};
	var id = req.body.id;
	Project.updateOne({"_id": id}, {$set: item}, function(err, result){
		console.log(result);
        if(result.modifiedCount == '0'){
            req.flash('updateProjectField', 'Something went wrong while update project')
            res.redirect('/dashboard/projects')
        }else{
            req.flash('updateProjectSuccess', 'Project updated successfully!')
            res.redirect('/dashboard/projects')
        }
	}) 
})

router.get('/isActive_project/:id', function(req, res, next) {
  var item ={isActive: false}	
  var id= req.params.id
	Project.updateOne({"_id": id}, {$set: item}, function(err, result) {
		if(result.modifiedCount == '0'){
            req.flash('inActiveField', 'Something went wrong while update project');
        }else{
            req.flash('inActiveSuccess', 'Updated successfully')
        }
        res.redirect('/dashboard/projects')
	})
})
router.get('/notActive_project/:id', function(req, res, next) {
  var item ={isActive: true}	
  var id= req.params.id
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		if(result.modifiedCount == '0'){
      req.flash('inActiveField', 'Something went wrong while update project');
    }else{
      req.flash('inActiveSuccess', 'Updated successfully')
    }
    res.redirect('/dashboard/projects')
	})
})

router.get('/projects', function(req, res, next) {
  var mysort = { _id: -1 };
  Project.find().sort(mysort).then((reslut)=>{
  res.render('dashboard/projects', {
    title: 'Project',
    projects: reslut,
    updateProjectSuccess: req.flash('updateProjectSuccess'),
    updateProjectField: req.flash('updateProjectField'),
    inActiveField: req.flash('inActiveField'),
    inActiveSuccess: req.flash('inActiveSuccess'),
    addProjectSuccess: req.flash('addProjectSuccess'),
    addProjectField: req.flash('addProjectField')
  });
});
});


// End Porjects Part 

// Start Skills Part

router.post('/add_skill', upload.single('image'), (req, res) =>{
  // console.log(req.file.filename);
  const skill = new Skills({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    skill: req.body.skill,
    imageskill: req.file.filename
  })
  if(!skill.save()){
    req.flash('addSkillField', 'Something went wrong while add Skill');
  }else{
    req.flash('addSkillSuccess', 'add Skill successfully')
    skill.save();
  }
  res.redirect('/dashboard/skills');
});


router.post('/update_skill', upload.single('imageskill'), function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
		skill: req.body.skill,
		imageskill: req.file.filename
	};
	var id = req.body.id;
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result){
        if(result.modifiedCount == '0'){
            req.flash('updateSkillField', 'Something went wrong while update skill')
            
            res.redirect('/dashboard/skills')
        }else{
            req.flash('updateSkillSuccess', 'Project skill successfully!')
            res.redirect('/dashboard/skills')
        }
	})
})

router.get('/isActive_skill/:id', function(req, res, next) {
  var item ={isActive: false}	
  var id= req.params.id
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		if(result.modifiedCount == '0'){
            req.flash('inActiveField', 'Something went wrong while update skill');
        }else{
            req.flash('inActiveSuccess', 'Updated successfully')
        }
        res.redirect('/dashboard/skills')
	})
})
router.get('/notActive_skill/:id', function(req, res, next) {
  var item ={isActive: true}	
  var id= req.params.id
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result) {
		if(result.modifiedCount == '0'){
            req.flash('inActiveField', 'Something went wrong while update skill');
        }else{
            req.flash('inActiveSuccess', 'Updated successfully')
        }
        res.redirect('/dashboard/skills')
	})
})

router.get("/skills", (req, res, next)=>{
    Skills.find().then((result) =>{
        res.render('dashboard/skills', {
            title: 'Skills',
            skills: result,
            addSkillSuccess: req.flash('addSkillSuccess'),
            addSkillField: req.flash('addSkillField'),
            updateSkillField: req.flash('updateSkillField'),
            updateSkillSuccess: req.flash('updateSkillSuccess'),
            inActiveField: req.flash('inActiveField'),
            inActiveSuccess: req.flash('inActiveSuccess')
        });
    })
})

// End Skills Part

// Start qualification

router.get("/qualification", (req, res, next)=>{
  Qualification.find().then((result) =>{
    res.render("dashboard/qualification", {title: "Qualifications", qualification: result})
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
  res.render('dashboard/qualification', {title: "qualification"});
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
  res.render('dashboard/qualification', {title: "qualification"})
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

// Start About part

router.post("/update_about",
 upload.fields([{name: 'image'}, {name: 'cv'}]),
 (req, res, next)=>{
    var item ={
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        title: req.body.title,
        description1: req.body.description1,
        description2: req.body.description2,
        image: req.files["image"][0].filename,
        cv: req.files["cv"][0].filename
    }
    var id = req.body.id
    About.updateOne({'_id': id}, {$set: item}, item, function(err, result){
        if(result.modifiedCount == '0'){
            req.flash('updateAboutField', 'Something went wrong while update about')
        }else{
            req.flash('updateAboutSuccess', 'Updated information successfully!')
        }
        res.redirect("/dashboard/about");
    })
})

// const about = new About({
//     firstname: "Khalifa",
//     lastname: "Alqiadi",
//     title: "Web Developer",
//     description1: "wekifjhifhwrhgkw",
//     description2: "rihjiwkehfiewhgf",
//     image: "img.png",
//     cv: "cv.pdf"
// })

// about.save();

router.get("/about", (req, res, next)=>{
    About.findOne({}).then((result)=>{
        res.render("dashboard/about",{
            title: "About me",
            abouts: result,
            updateAboutField: req.flash('updateAboutField'),
            updateAboutSuccess: req.flash('updateAboutSuccess'),
        })
    })
})

// End About part

module.exports = router;
