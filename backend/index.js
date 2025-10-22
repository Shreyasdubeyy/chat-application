// import express from "express"
// import dotenv from "dotenv";
// import dbConnect from "./DB/dbConnect.js";
// import authRouter from "./route/authUser.js"
// import messageRouter from "../backend/route/messageRoute.js"
// import cookieParser from "cookie-parser";
// import userRouter from "./route/userRoute.js"
// dotenv.config(); //used to safeguard endpoint port,through dotenv it can be accessed from anywhere
// const app=express();

// app.use(express.json());
// app.use(cookieParser());
// //to accept json data
// app.use('/api/auth',authRouter)
// app.use('/api/message',messageRouter)
// app.use('/api/user',userRouter)


// app.post('/',(req,res)=>{
//    res.send("Response sent")
// })



// const PORT=process.env.PORT 
// app.listen(PORT,()=>{
//     dbConnect()
//     console.log(`Working at ${PORT}`)
// })
import dotenv from 'dotenv'

import express from "express"
import dbConnect from "./DB/dbConnect.js";
import authRouter from  './route/authUser.js'
import messageRouter from './route/messageRoute.js'
import userRouter from './route/userRoute.js'
import cookieParser from "cookie-parser";
import path from "path";

import {app , server} from './Socket/socket.js'

const __dirname = path.resolve(process.cwd(), 'backend', '.env');
dotenv.config();



// Try different possible paths
// const pathsToTry = [
//     path.resolve(__dirname, '.env'),
//     path.resolve(process.cwd(), '.env'),
//     path.resolve(process.cwd(), 'backend', '.env'),
// ];

// for (const envPath of pathsToTry) {
//     console.log('Trying path:', envPath);
//     const result = dotenv.config({ path: envPath });
//     if (!result.error) {
//         console.log('Successfully loaded from:', envPath);
//         break;
//     }
// }

console.log("JWT_SECRET:", process.env.JWT_SECRET);

// if (!process.env.JWT_SECRET) {
//     process.env.JWT_SECRET = 'shreyasdubey';
//     console.log('Using hardcoded JWT_SECRET');
// }

console.log("JWT_SECRET:", process.env.JWT_SECRET);


app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/message',messageRouter)
app.use('/api/user',userRouter)

app.use(express.static(path.join(__dirname,"/frontend/dist")))

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
    dbConnect();
    console.log(`Working at ${PORT}`);
})