const userModel = require('../models/user-model');
const ownerModel = require('../models/owner-models');
const express = require("express");
const router= express.Router();
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateToken}=require("../utils/generateToken");
module.exports.registerUser=async function(req,res){ 
  try{
  let {email,password,fullname}=req.body;
  let user =await userModel.findOne({email:email});
  if(user){
    req.flash("error","You already have an account,please login.");
    return res.redirect("/");
  }

 bcrypt.genSalt(10,function(err,salt){
  bcrypt.hash(password,salt,async function (err,hash) {
    if(err) return res.send(err.message);
    else{
      try {
        let user=await userModel.create({
          email,
          password:hash,
          fullname,
        });
        let token =generateToken(user);
        res.cookie("token",token);
        res.redirect("/shop");
      } catch (validationError) {
        if (validationError.name === 'ValidationError') {
          // Handle validation errors (like minLength for fullname)
          const errorMessages = Object.values(validationError.errors).map(err => err.message);
          req.flash("error", errorMessages[0]); // Show the first validation error
          return res.redirect("/");
        }
        // Handle other errors
        req.flash("error", "Something went wrong during registration");
        return res.redirect("/");
      }
    }
  });
 });
  
  }catch(err){
    res.send(err.message);
  }
};

module.exports.loginUser=async function(req,res){
   let {email,password}=req.body;
   let user =await userModel.findOne({email:email});

   if(!user) {
    req.flash("error", "Email or Password incorrect");
    return res.redirect("/");
   }

   bcrypt.compare(password,user.password,function(err,result){
    if(result){
      let token=generateToken(user);
      res.cookie("token",token);
      res.redirect("/shop");
    }else{
      req.flash("error","Email or Password incorrect");
      return res.redirect("/");
    }
   });

};

module.exports.logout = function (req, res) {
 res.cookie("token","");
 res.redirect("/");
};

// Owner authentication functions
module.exports.registerOwner = async function(req, res) {
  try {
    let {email, password, fullname, gstin} = req.body;
    let owner = await ownerModel.findOne({email: email});
    if(owner) {
      req.flash("error", "Owner already exists, please login.");
      return res.redirect("/owners/login");
    }

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if(err) return res.send(err.message);
        else {
          try {
            let owner = await ownerModel.create({
              email,
              password: hash,
              fullname,
              gstin,
              isadmin: true
            });
            let token = generateToken(owner);
            res.cookie("ownerToken", token);
            res.redirect("/owners/createproducts");
          } catch (validationError) {
            if (validationError.name === 'ValidationError') {
              // Handle validation errors (like minLength for fullname)
              const errorMessages = Object.values(validationError.errors).map(err => err.message);
              req.flash("error", errorMessages[0]); // Show the first validation error
              return res.redirect("/owners/login");
            }
            // Handle other errors
            req.flash("error", "Something went wrong during owner registration");
            return res.redirect("/owners/login");
          }
        }
      });
    });
  } catch(err) {
    req.flash("error", "Something went wrong during owner registration");
    return res.redirect("/owners/login");
  }
};

module.exports.loginOwner = async function(req, res) {
  let {email, password} = req.body;
  let owner = await ownerModel.findOne({email: email});

  if(!owner) {
    req.flash("error", "Email or Password incorrect");
    return res.redirect("/owners/login");
  }

  bcrypt.compare(password, owner.password, function(err, result) {
    if(result) {
      let token = generateToken(owner);
      res.cookie("ownerToken", token);
      res.redirect("/owners/createproducts");
    } else {
      req.flash("error", "Email or Password incorrect");
      return res.redirect("/owners/login");
    }
  });
};

module.exports.logoutOwner = function (req, res) {
  res.cookie("ownerToken", "");
  res.redirect("/owners/login");
};