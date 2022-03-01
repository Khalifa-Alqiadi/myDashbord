const authMiddelware = (req, res, next)=>{
    if(req.isAuthenticated()) return next()

    res.redirect("/dashboard/login")
}

module.exports = authMiddelware