import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js'; // Adjust the path if needed
// import { errorHandler } from '../utils/error.js';

export const UserMiddleware = async (req, res, next) => {
    try {
        // Retrieve token from cookies
        const token = req.cookies?.access_token;
        if (!token) {
            return res.status(400).json({message:"Token Not Found"});
        }

        // Verify token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT);
        const user = await User.findById(decoded._id).select('-password'); // Fetch user without password

        if (!user) {
            return res.status(404).json({message:"User Not Found"});
        }

        // Attach user to the request object
        req.user = user; 
        next();
    } catch (error) {
        return res.status(401).json({message:"Error"});
    }
};
