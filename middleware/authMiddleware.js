function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else
        res.redirect('/signin');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    else
        next();
}

function isVerify(req, res, next) {
    if(req.user.status!="Active") {
        res.redirect('/verifying');
        return ;
    }
    else next();
}

module.exports = {checkAuthenticated, checkNotAuthenticated, isVerify};