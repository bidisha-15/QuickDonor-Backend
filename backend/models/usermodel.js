import mongoose from "mongoose";

const getRandomPastDate = () => {
    const today = new Date();
    const pastDate = new Date(today.setMonth(today.getMonth() - Math.floor(Math.random() * 6)));
    return pastDate;
};

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
    },
    lastDonation: {
        type: Date,
        default: getRandomPastDate 
    }
    
    
}, {timestamps : true});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model("User", userSchema);
export default User;
