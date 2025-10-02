const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-models");

module.exports = async function(req, res, next) {
    // Initialize authentication status
    req.isAuthenticated = false;
    req.isOwnerAuthenticated = false;
    req.user = null;
    req.owner = null;
    req.userType = null; // 'user', 'owner', or null
    
    // Check if user token exists
    if (req.cookies.token) {
        try {
            let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            let user = await userModel.findOne({email: decoded.email}).select("-password");
            
            if (user) {
                req.isAuthenticated = true;
                req.user = user;
                req.userType = 'user';
            }
        } catch (err) {
            // Token is invalid, user is not authenticated
            req.isAuthenticated = false;
            req.user = null;
        }
    }
    
    // Check if owner token exists
    if (req.cookies.ownerToken) {
        try {
            let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
            let owner = await ownerModel.findOne({email: decoded.email}).select("-password");
            
            if (owner) {
                req.isOwnerAuthenticated = true;
                req.owner = owner;
                req.userType = 'owner';
            }
        } catch (err) {
            // Token is invalid, owner is not authenticated
            req.isOwnerAuthenticated = false;
            req.owner = null;
        }
    }
    
    next();
};
