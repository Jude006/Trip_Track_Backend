const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async(req,res)=>{
    const {userName,email,password} = req.body
    try {
        if(!userName || !email || !password){
            return res.status(401).json({message:"All fields are required"})
        }
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(401).json({message:"User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,12)
        const newUser = await User.create({
            userName,
            email,
            password:hashedPassword,
        })

        const token = jwt.sign( 
            {id:newUser._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        return res.status(201).json({
            message:"User created successfully",
            user:{id:newUser._id, userName:newUser.userName},
            token
        })
    } catch (error) {
        return res.status(400).json({message:"Error signing up", error:error.message})
    }
}

const login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message:"Invalid credential"})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({message:"Invalid credential"})
        }

        const token = jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        return res.status(201).json({
            message:"Login successfully",
            user:{id:user._id},
            token
        })
    } catch (error) {
        return res.status(401).json({message:"Error logging in",error})
    }
}

module.exports = {signup,login}