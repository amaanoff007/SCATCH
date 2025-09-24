const express=require('express');
const userModel = require('../models/user-model');
const router= express.Router();
const isLoggedin=require("../middlewares/isLoggedIn");
const {registerUser,loginUser,logout}=require("../controllers/authController");



router.get("/",function(req,res){
  res.send("hey its working");
});

router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);

module.exports=router;
