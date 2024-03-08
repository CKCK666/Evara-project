const mongoose =require ("mongoose")
const dotenv=require("dotenv")
dotenv.config()
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDb connected...........".bgGreen);
  } catch (error) {
    console.error(`Error:${error.message}`.red);
    process.exit(1);
  }
};

module.exports={connectDB}
