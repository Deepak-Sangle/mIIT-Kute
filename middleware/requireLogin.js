const jwt = require('jsonwebtoken');
const {JWT_SECURE} = require('../keys');
const mongoose = require('mongoose');
const User = mongoose.model("User");

module.exports = (req,res,next)=>{
    const {authorization} = req.headers;
    //authorization === Bearer ewefwegwrherhe
    if(!authorization){
        return res.status(401).json({error:"you must be logged in"})
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token,JWT_SECURE,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"You dont have permission to do this"})
        }
        const {_id} = payload;
        User.findById(_id)
            .then(userdata=>{
                req.user = userdata;
                next();
            });
    })
}