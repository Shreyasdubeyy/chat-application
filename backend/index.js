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
import cors from 'cors'
import dbConnect from "./DB/dbConnect.js";
import authRouter from  './route/authUser.js'
import messageRouter from './route/messageRoute.js'
import userRouter from './route/userRoute.js'
import cookieParser from "cookie-parser";
import path from "path";
import {app , server} from './Socket/socket.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}
console.log('✅ Environment variables loaded');

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/message',messageRouter)
app.use('/api/user',userRouter)

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
    dbConnect();
    console.log(`Working at ${PORT}`);
})