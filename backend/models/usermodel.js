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
    gender:{
        type:String,
        required:true
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
    // location:{
    //     type: String,
    // },
    // latitude:{
    //     type: Number,
    // },
    // longitude:{
    //     type: Number,
    // },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    canDonate: { 
        type: Boolean, 
        default: false 
    }, 
    
}, {timestamps : true});

// UserSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
