const db = require('../config/connection');
const bcrypt = require('bcrypt');
const products = require('../public/data/products');
const { ObjectId } = require('mongodb');
// get signup page
const getSignUp = (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    
    res.render('user/signUp');
  }
};

//post signup
const signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    let emailExist = await db.get().collection('cln_users').findOne({ email });

    if (!emailExist) {
      const hashedPassword = await bcrypt.hash(password, 10);
      let userData = {
        username,
        email,
        password: hashedPassword,
        createdDate: new Date(),
        updatedDate: null,
      };
      let result = await db.get().collection('cln_users').insertOne(userData);

      req.session.loggedIn = true;
      req.session.user = userData;
      res.json({ success: true, message: 'Form submitted successfully!' });
    } else {
      res.json({ success: false, message: 'Email already exists' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get home page
const getHome = async (req, res) => {
  const objectIdToFind = new ObjectId(req.session.user._id);
  let userExist = await db
    .get()
    .collection('cln_users')
    .find({ _id: objectIdToFind })
    .toArray();

  if (userExist && userExist.length > 0) {
    res.render('user/homePage', { products });
  } else {
    req.session.destroy();
    res.render('user/loginPage');
  }
};

//post login
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await db.get().collection('cln_users').findOne({ email });
    if (user) {
      let result = await bcrypt.compare(password, user.password);
      if (result) {
        req.session.loggedIn = true;
        req.session.user = user;

        res.json({ success: true, message: 'Form submitted successfully!' });
      } else {
        res.json({ success: false, message: 'Invaild email or password!' });
      }
    } else {
      res.json({ success: false, message: 'Invaild email or password!' });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//logout
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

module.exports = { getSignUp, signUp, getHome, login, logout };
