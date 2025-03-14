import User from '../models/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { errorHandler } from "../utils/error.js";

export const signUP = async(req, res, next)=>{
    const {username, email, gender, bloodtype, password} = req.body;   
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({username, email, gender, bloodtype, password : hashedPassword});
    
    try{
        await newUser.save();       
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json("New User Created Successfully!");
        }catch(error){
            console.log(error)
            res.status(500).json({message:"Error creating User"})
        }
}

export const signIN = async(req, res, next)=>{
    const {email, password} = req.body;
    try{
        const validUser = await User.findOne({email});
        if(!validUser){
            return res.status(401).json({message:"Invalid User"})
            // return next(errorHandler(401, 'Invalid Username / Password'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);
                if(!validPassword){
                  return res.status(401).json({message:"Password does not match", error: error.message})
                    // return next(errorHandler(401, 'Invalid Username / Password'));
                }
        const token = jwt.sign({_id : validUser.id}, process.env.JWT);
        const {password : pass, ...remaining} = validUser._doc;

        res.cookie('access_token', token,
            {
                httpOnly : true,
            })
            .status(200)
            .json(remaining)
        
    }catch(error){
       return res.status(400)
    }
}

export const signOut = async(req,res,next)=>{
    try{
        res.clearCookie("access_token");
        res.status(200).json("User has been logged out");
    }catch(error){
        return res.status(400)
    }
}



