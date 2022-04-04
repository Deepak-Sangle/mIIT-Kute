const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const {checkAuthenticated, isVerify} = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, "./public/img/uploads");
    },
    filename: function (req,file,cb){
        cb(null, Date.now()+file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits : {
        fieldSize : 1024*1024*10
    },
    fileFilter: fileFilter
});


router.get('/myprofile', checkAuthenticated, isVerify, (req,res)=>{
    const userdata = {
        name: req.user.name, 
        email: req.user.email,
        roll: req.user.roll,
        Name: req.user.Name,
        interest1: req.user.interest1,
        interest2: req.user.interest2,
        interest3: req.user.interest3,
        interest4: req.user.interest4,
        interest5: req.user.interest5,
        DP : req.user.DP
    };
    res.render('profile', {userdata});
});

router.put('/editprofile', upload.single('dp'),checkAuthenticated, isVerify, async (req,res)=>{
    const {Name, roll, interest1, interest2, interest3, interest4, interest5} = req.body;
    const usser = await User.findByIdAndUpdate(req.user._id, {
        $set :{
            Name: Name,
            roll : roll,
            interest1 : interest1,
            interest2 : interest2,
            interest3 : interest3,
            interest4 : interest4,
            interest5 : interest5,
        }
    });
    
    if(req.file!=undefined){
        newpath = req.file.destination.replace('./public','')+'/'+req.file.filename
        const usser = await User.findByIdAndUpdate(req.user._id, {
            $set :{
                DP: newpath
            }
        });
    }
    res.redirect('/myprofile');
});

router.get('/editprofile', checkAuthenticated, isVerify, (req,res)=>{
    const userdata = {
        name: req.user.name, 
        email: req.user.email,
        roll: req.user.roll,
        Name: req.user.Name,
        interest1: req.user.interest1,
        interest2: req.user.interest2,
        interest3: req.user.interest3,
        interest4: req.user.interest4,
        interest5: req.user.interest5,
        DP: req.user.DP
    };
    res.render('editprofile', {userdata});
})

module.exports = router;
