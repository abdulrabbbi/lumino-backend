import mongoose from "mongoose";

const connectToDatabase = async (mongodb_url) =>{
    if (!mongodb_url) {
        console.warn('MONGODB_URL is not set; skipping database connection.');
        return;
    }
    try{
        await mongoose.connect(mongodb_url)
        console.log('Connected to database successfully');
    }
    catch(error){
        console.log(error);
        
        console.log('Failed to connect with database');
    }
}

export default connectToDatabase;
