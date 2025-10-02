const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-models");

module.exports = async function(req, res, next) {
    if (!req.cookies.ownerToken) {
        req.flash("error", "You need to login as owner first");
        return res.redirect("/owners/login");
    }
    try {
        let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
        let owner = await ownerModel.findOne({email: decoded.email}).select("-password");

        req.owner = owner;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong with owner authentication.");
        res.redirect("/owners/login");
    }
};
