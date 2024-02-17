const MongoClient=require("mongodb").MongoClient
let state={
  db:null
}


const connectDb=()=>{
MongoClient.connect(process.env.MONGO_URI).then(async(client)=>{
   console.log("DB successfully connected".bgGreen);
   state.db=client.db()
  
  
})
.catch((error)=>{
  console.log("error to connect database".bgRed,error);
  throw error;
})

}

module.exports={connectDb}
module.exports.get=function(){
  return state.db
}