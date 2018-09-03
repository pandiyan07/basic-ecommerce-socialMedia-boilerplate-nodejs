const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const ehandlebars = require('express-handlebars');
const expressValidator = require('express-validator');

const routes = require('./routes/artificialRouter');
const app = express();

app.use(session({
  name: 'stupid',
  secret: '$@%@&&@*^@@$^%$*^%@^&^%*$&$%^@786745',
  resave: false,
  saveUninitialized: false,   
  cookie: {
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge:  10000
  }
}));

app.use('/css', express.static(__dirname + '/css'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true})); 
app.use(expressValidator());
app.use('/',routes);

process.env.NODE_ENV = 'development';
app.enable('view cache');
app.set('port', (process.env.PORT || 8080));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars'); 
app.engine('handlebars', ehandlebars({
  defaultLayout: 'base',
  extname: 'handlebars',
}));


app.listen(app.get('port'), function() {
  console.log('Listening at port number '+app.get('port'));
});


/*
use formidable
use connect-mongo`
use nodemailer
use serve-favicon module
use compression module to shrink the http payload
adding a website footer with navigation and terms and conditions and privacy policy
add a bootstrap or material design lite WARNING modal box, when the provided email id is already there

make use of the option "keep me signed in option"
using express-messages and connect-flash for flash messages like 
  "Account created successfully"
  "Logged out successfully"
*/