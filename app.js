const fs = require('fs');
const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const samlp = require('samlp');
const passport = require('passport');
const { Strategy } = require('passport-local');
const profileMapper  = require('./ProfileMapper');

dotenv.config();

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);
});

userDB = {
    email: 'testuser@orgdomain.com',
    given_name: 'Leo',
    family_name: 'Messi',
    password: 'password'
}

passport.use(new Strategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    },
    function(email, password, done) {
        if (!email || !password) { return done(null, false, 'please provide email and password'); }
        if ( email === userDB.email && password === userDB.password) {
            return done(null, userDB);
        }
    })
);

const app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else
        return res.redirect('/login');
}

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login/fail' }),
    function (req, res) {
        res.redirect('/samlp');
    }
);

app.get('/', ensureAuthenticated, function (req, res) {
    res.status(200).send(`User authenticated ${JSON.stringify(req.user)}`);
})

app.get('/user', ensureAuthenticated, function (req, res) {
    res.status(200).send(`User authenticate ${JSON.stringify(req.user)}`)
})

app.get('/login', function (req, res) {
    res.render('login');
})


app.get('/samlp', ensureAuthenticated, samlp.auth({
    issuer:     process.env.IDP_ENTITY_ID,
    cert:       fs.readFileSync(__dirname + '/certs/signing_cert.pem', 'utf8'),
    key:        fs.readFileSync(__dirname + '/certs/signing_key.pem', 'utf8'),
    signResponse: true,
    authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
    signatureNamespacePrefix: 'ds',
    profileMapper: profileMapper,
    nameIdentifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    destination: process.env.DESTINATION,
    audience: process.env.AUDIENCE,
    recipient: process.env.RECIPIENT,
    getUserFromRequest: function(req) {
        return req.user;
    },
    getPostURL: function (wtrealm, wreply, req, callback) {
        return callback( null, process.env.DESTINATION)
    }
}));

app.get('/samlp/FederationMetadata/2007-06/FederationMetadata.xml', samlp.metadata({
    issuer:   process.env.IDP_ENTITY_ID,
    cert:     fs.readFileSync(__dirname + '/certs/signing_cert.pem', 'utf8')
}));

const server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port)
});
