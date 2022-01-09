const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");


router.get('/user/:id', requireLogin, (req, res) => { //The user must be logged into the app to view other users profile(using "requireLogin")

    User.findOne({ _id: req.params.id })
        .select("-password")//This method allows us to select a certain parameter(text) on a page and work with it. We selected & added "-" in front of password becasue we don't want to retrun that to the front end
        .then((user) => {

            //console.log(user)
            Post.find({ postedby: req.params.id })
                .populate("postedby", "_id name")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(404).json({ error: "User not found" })
                        //return res.status(422).json({error:err})
                    }

                    return res.json({ user, posts })
                })
        })
        .catch(err => {
            return res.status(404).json({ error: "User not found" })
        })

});


// router.put('/follow', requireLogin, (req, res) => {

//     User.findByIdAndUpdate(req.body.followId,   //findOneAndUpdate(conditions, update, options, callback) <----  template structure
//         { 
//             $push: { followers: req.body._id}//check this is it's body or user!!!
//         },
//         {
//             new: true
//         },
//         (err, result) => {
//             if(err){
//                 return res.status(422).json({error:err})
//             }

//             User.findByIdAndUpdate(req.user._id,
//              {
//                  $push: { following: req.body.followId}
//              },
//              {
//                  new: true
//              })
//              .select("-password")
//              .exec((err, result) => {
//                 if(err){
//                     return res.status(422).json({error:err})
//                 }

//                 return res.json({result})
//              })
//         }
//         )     
// })


router.put('/follow', requireLogin, (req, res) => {

    User.findByIdAndUpdate(req.body.followId,   //findOneAndUpdate(conditions, update, options, callback) <----  template structure
        { 
            $push: { followers: req.user._id}//check this is it's body or user!!!
        },
        {
            new: true
        },
        (err, result) => {
            if(err){
                return res.status(422).json({error:err})
            }

            User.findByIdAndUpdate(req.user._id,
             {
                 $push: { following: req.body.followId}
             },
             {
                 new: true
             })
             .select("-password")
             .exec((err, result) => {
                if(err){
                     res.status(422).json({error:err})
                }
                //console.log(result)
                //return res.json({result})  //This returns an object with updated "following" only
             })
             console.log("result",result)
              return res.json({result})
        }
        )     
})


router.put('/unfollow', requireLogin, (req, res) => {

    User.findByIdAndUpdate(req.body.followId,   //findOneAndUpdate(conditions, update, options, callback) <----  template structure
        { 
            $pull: { followers: req.user._id}//check this is it's body or user!!!
        },
        {
            new: true
        },
        (err, result) => {
            if(err){
                return res.status(422).json({error:err})
            }

            User.findByIdAndUpdate(req.user._id,
             {
                 $pull: { following: req.body.followId}
             },
             {
                 new: true
             })
             .select("-password")
             .exec((err, result) => {
                if(err){
                    return res.status(422).json({error:err})
                    
                }
                //console.log(result)
                
             })
             return res.json({result})
        }
        )     
})



module.exports = router;