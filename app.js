const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { connectDB } = require('./config/connection');
const app = express();
require('dotenv').config();
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const adminRoutes = require('./routes/adminRoutes');
const handlebars = require('./utils/handleBar-helper');
var logger = require('morgan');
const passport = require('./middlewares/passport-setup');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const secret = uuidv4();
connectDB();

app.set('views', path.join(__dirname, 'views'));
const hbs = exphbs.create({
  handlebars: handlebars,
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/',
});
app.use(
  session({
    name: 'ckCookie',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
// Register the engine with Express
app.engine('hbs', hbs.engine);

// Set Handlebars as the view engine
app.set('view engine', 'hbs');

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
const disableBackButton = (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store,must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}; 

app.use('/', disableBackButton,userRoutes);
app.use('/admin',disableBackButton, adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`.bgGreen);
});
