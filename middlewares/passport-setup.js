const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENTID,
    clientSecret:process.env.GOOGLE_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
     console.log(profile)
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    
    done(null, user);
});

passport.deserializeUser((user, done) => {
    
        done(null, user);
    
});

module.exports = passport;