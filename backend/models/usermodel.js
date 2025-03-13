import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true,
    },
    email: {
        type : String,
        required : true,
        unique : true,
    },
    phone:{
        type:String 
    },
    bloodtype:{
        type:String,
        required: true
    },
    password: {
        type : String,
        required : true,
    },
    location:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    }
    
    
}, {timestamps : true});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model("User", userSchema);
export default User;
