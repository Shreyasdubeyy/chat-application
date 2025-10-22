import mongoose from "mongoose"

const dbConnect= async()=>{
    try {

        await mongoose.connect("mongodb+srv://shreyas:shreyas123@cluster0.ggdgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("Database Connected Successfully")
        
    } catch (error) {
        console.log(console.error(error));
    }
}

export default dbConnect