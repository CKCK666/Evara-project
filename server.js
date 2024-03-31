const express=require("express")
const path =require("path")
const exphbs=require("express-handlebars")
 const {connectDB}=require("./config/connection")
const app=express()
require("dotenv").config()
const colors = require('colors')
 const userRoutes =require("./routes/userRoutes")
const  session=require('express-session')
const adminRoutes =require("./routes/adminRoutes")
const handlebars = require('handlebars');
var logger = require("morgan"); 
const passport = require('./middlewares/passport-setup');
const moment = require('moment');
connectDB()
handlebars.registerHelper('eq', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('formatDate', function(startDate) {
  const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`
  console.log(formattedStartDate);
  return  formattedStartDate;
});
app.set("views",path.join(__dirname,"views"))
const hbs = exphbs.create({
  handlebars: handlebars,
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
});
app.use(session({
  name:"ckCookie",
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
// Register the engine with Express
app.engine('hbs', hbs.engine);

// Set Handlebars as the view engine
app.set('view engine', 'hbs');

// app.use(logger("dev"));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,"public")))

app.use(passport.initialize());
app.use(passport.session());


app.use("/",userRoutes)
app.use("/admin",adminRoutes)


 
const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
  console.log(`server running on http://localhost:${PORT}`.bgGreen)
    
})
