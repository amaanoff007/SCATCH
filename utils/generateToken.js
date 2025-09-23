const generateToken =(user)=>{
    return  jwt.sign({email:user.email,id:user._id},"heyheyheye");
}
module.exports.generateToken=generateToken;