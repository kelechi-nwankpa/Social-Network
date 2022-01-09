const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post") //require("../models/post"); Using <<<< this still worked for some reason i don't know


router.post("/createpost", requireLogin,(req, res) => {
    const {title, body, photo} = req.body;
    req.user.password = undefined;

    if(!title||!body||!photo){
        return res.status(422).json({error:"Please, fill all empty fields"})
    }

    const post = new Post({
        title,
        body,
        photo,
        postedby: req.user
    })

    post.save()
    .then((result) => {
        res.json({post: result})
    })
    .catch((err) =>{
        console.log(err)
    })
})

router.get("/allposts", requireLogin, (req, res) =>{

    Post.find()
    .populate("postedby", "_id name" )
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
        res.json({post:posts})
    })
    .catch((err)=> {
        console.log(err)
    })
})

router.get("/mypost", requireLogin, (req, res) => {

    Post.find({postedby:req.user._id}) //This req.user was initialized(where we first named it) in the "requireLogin" middleware 
    .populate("postedby", "_id name")
    .then((mypost) => {
        res.json({mypost})
    })
    .catch((err) => {
        console.log(err)
    })
})


router.put("/like", requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, //This requests the ID of the post that is being interacted with from the front end.
        { $push:{likes:req.user._id}}, 
        {new:true})//This is to make sure that the updated doc(In the MongoDB) is returned
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error:err})
            }else{
                res.json({result})
            }
        }) //findOneAndUpdate(conditions, update, options, callback) <----  template structure   
})

router.put("/unlike", requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, 
        { $pull:{likes:req.user._id}}, 
        {new:true})
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error:err})
            }else{
                res.json({result})
            }
        }) //findOneAndUpdate(conditions, update, options, callback) <----  template structure   
})

router.put("/comment", requireLogin, (req, res) => {
    const comment = {
        text:req.body.text,
        postedBy:req.user,
        name:req.body.name
    }


    Post.findByIdAndUpdate(req.body.postId, 
        { $push:{comments:comment}}, 
        {new:true})
        .populate("postedby", "_id name" )
        .populate("comments.postedBy", "_id name")//This works on the property in the Post scehema that we want to work with(it expands the detail)
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error:err})
            }else{
                res.json({result})
            }
        }) //findOneAndUpdate(conditions, update, options, callback) <----  template structure   
})

router.delete("/deletepost/:postId", requireLogin, (req, res) =>{

    Post.findOne({_id:req.params.postId})
    .populate("postedby", "_id")
    .exec((err, post) => {

        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedby._id.toString() === req.user._id.toString()){
            post.remove()
            .then((result) => res.json(result)) //This line sends to the front end the _id(i think i can only send one _id at a time) that has been deleted
            .catch(err => {
                console.log(err)
            })
        }
    })
})

module.exports = router;