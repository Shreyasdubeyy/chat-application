import User from "../Models/userModels.js";
import bcryptjs from "bcryptjs"
import jwtToken from "../utils/jwtWebToken.js";
export const userRegister=async(req,res)=>{
    try {
        const { fullname , username , email , gender , password , profilepic } = req.body;
        
        if (password.length < 6) {
            return res.status(400).send({success:false,message:"Password must be at least 6 characters long"});
        }
        
        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if(user) return res.status(400).send({success:false,message:"Username or Email Already Registered"})
        
        const hashPassword = bcryptjs.hashSync(password,10);

        const newUser = new User({
            fullname,
            username,
            email,
            password:hashPassword,
            gender,
            profilepic: profilepic || ""
        })

        if(newUser){
            await newUser.save();
            jwtToken(newUser._id,res)
            return res.status(201).send({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                profilepic: newUser.profilepic,
                email: newUser.email
            })
        } else {
            return res.status(500).send({success:false,message:"Invalid user data"})
        }

    } catch (error) {
        console.error("Error in userRegister:", error);
        res.status(500).send({success:false,message:"Server error during registration"})
    }
}

export const userLogin=async(req,res)=>{
    try {
        const { email , password }=req.body
        const user = await User.findOne({email})

        if(!user){
            return res.status(401).send({success:false,message: "Invalid email or password"})
        }
        const comparePass=bcryptjs.compareSync(password,user.password || "")

        if(!comparePass){
            return res.status(401).send({success:false,message:"Invalid email or password"})
        }

        jwtToken(user._id,res)

        res.status(200).send({
            _id: user._id,
            fullname:user.fullname,
            username: user.username,
            profilepic: user.profilepic,
            email: user.email,
            message:"Successfully Login"
        })

    } catch (error) {
        console.error("Error in userLogin:", error);
        res.status(500).send({success:false,message:"Server error during login"})
    }
}

export const userLogout=async(req,res)=>{
    try {
        res.cookie("jwt","",{
            maxAge:0
        })
        res.status(200).send({message:"User logout"})
    } catch (error) {
        console.error("Error in userLogout:", error);
        res.status(500).send({success:false,message:"Server error during logout"})
    }
}
