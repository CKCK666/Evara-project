const MongoClient=require("mongodb").MongoClient
let state={
  db:null
}


const connectDb=()=>{
MongoClient.connect("mongodb+srv://vishnu:12345@vishnu.on0y3.mongodb.net/Evara_ecommerce?retryWrites=true&w=majority").then(async(client)=>{
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