const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User =require("../models/userModel")
const { ObjectId } = require('mongodb');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'http://www.evara-ecommerce.online/auth/google/callback',
    scope: ['profile', 'email'] 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        
        
        let user = await User.findOne({ strEmail:profile.emails[0].value ,strStatus:"Active"});
        
        if (!user) {

            let user=new User ({
                pkUserId:new ObjectId(),
                googleId: profile.id,
                strUserName:profile.displayName,
                strEmail:profile.emails[0].value,
                strPassword: "123456789",
                strPhoneNumber:"7907497841",
                strProfileImg:null,
                createdDate: new Date(),
                updatedDate: null,
              })
            // If the user doesn't exist, create a new user
          

            await user.save(); // Save the user to the database
        }
       
        // Pass the user to the next stage of the authentication process
        done(null, user);
    } catch (err) {
        console.log(err)
        done(err, null); // Pass any errors to the done callback
    }
}));

passport.serializeUser((user, done) => {
    done(null, user); // Serialize the user by their ID
});

passport.deserializeUser(async (user, done) => {
    try {
       
        done(null,user); // Pass the user to the next stage
    } catch (err) {
        done(err, null); // Pass any errors to the done callback
    }
});

module.exports = passport;
