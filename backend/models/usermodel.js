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
        // unique : true,
    },
    location:{
        type: String,
    },
    latitude:{
        type: Number,
    },
    longitude:{
        type: Number,
    },
    
    
}, {timestamps : true});

const User = mongoose.model("User", userSchema);
export default User;
