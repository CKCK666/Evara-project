const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '241557673778-h5jtjs0u4a0qlpasfj3dgtgs7i8kj49c.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:5000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Handle user authentication here
    // This is where you would save the user to your database
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    
    done(null, user);
});

passport.deserializeUser((user, done) => {
    
        done(null, user);
    
});

module.exports = passport;