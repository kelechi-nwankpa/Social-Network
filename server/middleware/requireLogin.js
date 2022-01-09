const jwt = require("jsonwebtoken");
const { JWT_SECRET} = require("../valuekeys.js");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
    const {authorization} = req.headers;//How come authorization in small letters still works even though from the front end, the first letter is in Caps?
    if(!authorization) {
       return res.status(401).json({error: "You Must be logged in"});
    }

    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            return res.status(401).json({error: "You must be logged in"})
        }

        const {_id } = payload; //This payload is gotten from token(_id) in authen.js because it was the only property used to sign
        //console.log(payload);
        User.findById(_id)
        .then((userData) => {
            //console.log(userData)
            req.user = userData
            next()
        })
        
    })
}