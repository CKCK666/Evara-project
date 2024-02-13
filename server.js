const express=require("express")
const path =require("path")
const exphbs=require("express-handlebars")
 const {connectDb}=require("./config/connection")
const app=express()
const dotenv=require("dotenv")
const colors = require('colors')
// const userRoutes =require("./routes/userRoutes")
const adminRoutes =require("./routes/adminRoutes")
const handlebars = require('handlebars');
var logger = require("morgan");
dotenv.config()
connectDb()
handlebars.registerHelper('eq', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
app.set("views",path.join(__dirname,"views"))
const hbs = exphbs.create({
  handlebars: handlebars,
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
});
// Register the engine with Express
app.engine('hbs', hbs.engine);

// Set Handlebars as the view engine
app.set('view engine', 'hbs');

// app.use(logger("dev"));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,"public")))




// app.use("/",userRoutes)
app.use("/admin",adminRoutes)

 
const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
  console.log(`server running on http://localhost:${PORT}`.bgGreen)
    
})
