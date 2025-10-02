const express=require('express');
const router= express.Router();
const upload=require("../config/multer-config");

router.post("/create",upload.single("image"),function(req,res){
  res.send(req.file);
});

module.exports=router;
