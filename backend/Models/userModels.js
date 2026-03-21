import mongoose from "mongoose"

const userSchema=mongoose.Schema({
    fullname:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required:true,
        unique:true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    gender:{
        type: String,
        required:true,
        enum:["male","female"]
    },
    password:{
        type: String,
        required:true,
        minlength:6
    },
    profilepic:{
        type: String,
        required:false,
        default:""
    },
    about:{
        type: String,
        default: "Hey there! I am using LinkUp.",
        maxlength: 150
    }
},{timestamps:true}) //timestamps tells about current timestamp

const User= mongoose.model("User",userSchema) //model name,model schema
export default User