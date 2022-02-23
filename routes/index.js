var express = require('express');
const multer = require("multer");
const mongoose = require("mongoose");
const assert = require("assert")
var router = express.Router();
const Project = require('../models/user');
const Skills = require('../models/skill');
const Qualification = require('../models/qualification');

const db = require("../database/db");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/images/admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "png") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/* destination: (req, file, cb) => {
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
});*/

/* GET home page. */

router.get("/", (req, res, next)=>{
  
    res.render("index", {title: "DASHBORD", ProjectCont: proj()})
})

function proj(){
  Project.count({}, (err, result)=>{
    return result;
  })
}

router.get('/projects', function(req, res, next) {
  Project.find().then((reslut)=>{
  res.render('projects', {title: 'Project',projects: reslut});
});
  // res.render('users', {title: 'users'});
});

router.post('/add_project', upload.single('image'), (req, res) =>{
  // console.log(req.file.filename);
  const project = new Project({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    link: req.body.link,
    image: req.file.filename
  })
  project.save();
  res.redirect('/index');
});

router.post('/update_project', function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
		link: req.body.link,
	};
	var id = req.body.id;
	Project.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		assert.equal(null, err);
		console.log("item updated");
	})
  res.redirect('/index')
})

router.get('/delete_project/:id', function(req, res, next) {	
	Project.deleteOne({"_id": req.params.id}, function(err, result) {
		if (err) {
			console.log('error' ,err)
			res.redirect('/index')
		} else {
			res.redirect('/index')
		}
	})
})


// Skills Part 

router.get("/skills", (req, res, next)=>{
  Skills.find().then((result) =>{
    res.render("skills", {title: "Skills", skills: result})
  })
})


router.post('/add_skill', upload.single('image'), (req, res) =>{
  // console.log(req.file.filename);
  const skill = new Skills({
    id: mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    imageskill: req.file.filename
  })
  skill.save();
  res.render('skills', {title: "Skills"});
});


router.post('/update_skill', function(req, res, next){
	var item = {
		name: req.body.name,
		description: req.body.description,
	};
	var id = req.body.id;
	Skills.updateOne({"_id": id}, {$set: item}, item, function(err, result){
		assert.equal(null, err);
		console.log("item updated");
	})
  res.render('skills', {title: "Skills"})
})

router.get('/delete_skill/:id', function(req, res, next) {	
	Skills.deleteOne({"_id": req.params.id}, function(err, result) {
		if (err) {
			console.log('error' ,err)
			res.render('/index')
		} else {
			res.redirect('/index')
		}
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
		assert.equal(null, err);
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
