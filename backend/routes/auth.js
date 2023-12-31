const express = require('express');
const User  = require( '../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Harryisagoodb$oy';

//ROUTE1: Create  a user using : POST "/api/auth/createuser". no login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min : 3}),
    body('email','enter a valid email').isEmail(),
    body('password','password must be atleast 5 characters').isLength({min : 5})
], async (req,res)=>{
    let success= false;
    //if there are errors return bad request and the error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }
    //check wether the user with same email exists already
    try{

   
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success,error: "Sorry a user with this email already exists"});
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);
    //creat a user
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
    })
    const data = {
        user:{
            id:user.id
        }
    } 
    const authtoken = jwt.sign(data,JWT_SECRET);
   
    success=true;
    res.json({success,authtoken});
}catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured");
    }
} )

//ROUTE2: Authenticate  a user using : POST "/api/auth/login". no login required
router.post('/login',[
    body('email','enter a valid email').isEmail(),
    body('password','password cannot be blank').exists(),
], async (req,res)=>{

    let success= false;
    //if there are errors return bad request and the error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }


    const {email,password}=req.body;
    try {
        let user = await  User.findOne({email});
        if(!user){
            success=false;
            return res.status(400).json({success,error: "Please try to connect with correct credentials"});
        }

        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            success=false
            return res.status(400).json({success,error: "Please try to connect with correct credentials"});
        }

        const data = {
            user:{
                id:user.id
            }
        } 
        const authtoken = jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authtoken});

    } catch (error) {
        console.error(error.message);
      res.status(500).send("Internal server error occured");

    }

})

//ROUTE3: Get logged in using details  using : POST "/api/auth/getuser". Login required
router.post('/getuser',fetchuser, async (req,res)=>{

try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user); 
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
}
})
module.exports = router