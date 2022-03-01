var express = require('express');
const multer = require("multer");
const mongoose = require("mongoose");
var router = express.Router();
const Project = require('../models/projects');
const Skills = require('../models/skill');
const About = require('../models/about');
const Qualification = require('../models/qualification');
const userInfo = require("../models/userinfo");
const db = require("../database/db");
const flash = require('req-flash');

let all_projects,
    aboutMe,
    allSkills;
router.get("/", (req, res, next)=>{
  var sortId = { _id: -1 };
  Project.find().sort(sortId).then((result)=>{
    all_projects = result;
  })
  About.findOne({}).then((result)=>{
    aboutMe = result
  })
  Skills.find().then((result)=>{
    allSkills = result
  })
  res.render("index", {
    title: 'Khalifa Alqiadi',
    projects: all_projects,
    abouts: aboutMe,
    skills: allSkills
  })
})

module.exports = router;
