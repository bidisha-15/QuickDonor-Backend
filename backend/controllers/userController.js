import User from '../models/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { errorHandler } from "../utils/error.js";

// export const signUP = async(req, res, next)=>{
//     const {username, email, gender, bloodtype, password} = req.body;   
//     const hashedPassword = bcrypt.hashSync(password, 10);
//     const newUser = new User({username, email, gender, bloodtype, password : hashedPassword});
export const signUP = async(req, res)=>{
    const {username, email, bloodtype, gender, password, latitude, longitude} = req.body;   
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({username, email, bloodtype, gender, password : hashedPassword, location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
    }});
    
    try{
        await newUser.save();       
        return res.status(201).json({message: "New User Created Successfully!"});
        }catch(error){
            console.log(error)
            res.status(500).json({message:"Error creating User"})
        }
}

export const signIN = async(req, res)=>{
    const {email, password} = req.body;
    try{
        const validUser = await User.findOne({email});
        if(!validUser){
            return res.status(401).json({message:"Invalid credentials"})
            // return next(errorHandler(401, 'Invalid Username / Password'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);
                if(!validPassword){
                  return res.status(401).json({message:"Password does not match", error: error.message})
                    // return next(errorHandler(401, 'Invalid Username / Password'));
                }
        const token = jwt.sign({_id : validUser.id}, process.env.JWT, {expiresIn: '1h'});
        const {password : pass, ...remaining} = validUser._doc;

        return res.cookie('access_token', token,
            {
                httpOnly : true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            })
            .status(200).json(remaining);
        
    }catch(error){
       return res.status(500).json({ message: "Error signing in" });
    }
}

export const signOut = async(req,res)=>{
    try{
        res.clearCookie("access_token");
        return res.status(200).json("User has been logged out");
    }catch(error){
        return res.status(500).json({ message: "Error signing out" });
    }
}



