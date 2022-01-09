const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../valuekeys");
const requireLogin = require("../middleware/requireLogin");




router.get("/", (req,res) => {

    res.send("Hello World!!!!")
})

router.post("/signup", (req, res) => {

    const {name, email, password} = req.body;
    if(!email || !name || !password) {
        return res.status(422).json({error: "You will need to provide all the information asked"})
    }
   
    User.findOne({email:email})
    .then((savedUser) => {
        if(savedUser) {
           res.status(422).json({error: "User already exists with that email ID"})
        }

        bcrypt.hash(password, 12).then((hsdpassword) => {
            const user = new User({
                name,
                password: hsdpassword,
                email
            });
    
            user.save()
            .then((user) => {
                res.json({message: "Saved Successfully"})
            })
            .catch(err => {
                console.log(err)
            })
        })
     })
    .catch(err => {
        console.log(err);
    }) 
});

//IN order to ask for data from the server, we have to hit this route
router.get("/protected", requireLogin , (req, res) => {
    res.send("Hello USERrr!!!!")
})

router.post("/signin",(req, res) => {
    const {email, password} = req.body;
    if(!email||!password){
        return res.status(422).json({error:"Please input your email and password"})
    }
    User.findOne({email:email})
    .then((savedUser)=> {
        if(!savedUser){
        return res.status(422).json({error:"Invalid email and password"})
        
        }
        bcrypt.compare(password, savedUser.password)
        .then((doMatch) => {
            if(doMatch){
                //return res.json({message:"Successfully signed in"});
                const token = jwt.sign({_id:savedUser._id}, JWT_SECRET);//I only gave it the ID to sign with. I could have other key-value pairs in the object
                const {_id, name, email} = savedUser
                res.json({token, user:{_id, name, email}})//This is sent as a response to the front end(Login.js)
            } else{
                return res.status(422).json({error:"Invalid Email or Password"})
            }
        })
        .catch((err) =>{
            console.log(err)
        })
    })
})

module.exports = router;