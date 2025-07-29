import mongoose from "mongoose";

const connectToDatabase = async (mongodb_url) =>{
    try{
        await mongoose.connect(mongodb_url)
        console.log('Connected to database successfully');
    }
    catch(error){
        console.log('Failed to connect with database');
    }
}

export default connectToDatabase;