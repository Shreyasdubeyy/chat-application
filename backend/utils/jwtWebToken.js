import jwt from "jsonwebtoken"

const jwtToken=(userId,res)=>{
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is undefined!");
        throw new Error("JWT_SECRET is missing in environment variables");
    }
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"30d"
    })
    res.cookie("jwt",token,{
        maxAge:30*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure: process.env.NODE_ENV === "production"
    })
}

export default jwtToken