const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

var errors; // stores the validation errors
var dbpromise;  // passing a promise to the dbapi
var upINPUT = [];   // consists of the input from the promise
var dataInsert = {};    // holds the data that is to be written in the database
var urlContain; // stores the URL that must be rendered
var sessions;   // stores the logged in user's session ID
var UserNamePresent;    // consists of boolean value, like true or false
var loggedOut;  // consists of boolean value, like true or false
var PassWordError;  // consists of boolean value, like true or false
var UserNameError;  // consists of boolean value, like true or false

const dbapi = require('./dbapi.js');

var Promise_error_Handler = function(err) {
    console.log(err);
}

try {
    router.get(/^(.+)$/, function(req,resp) {
        urlContain = req.url;
        if(sessions) {
            switch(urlContain) {
            
                case '/home':
                    resp.render('home',{title:'Home'});
                    break;

                case '/cal':
                    resp.render('cal',{title:'Printing Demo'});
                    break;

                case '/':
                    // when logged in index page must not be accessible
                    resp.redirect('/home');
                    break;

                case '/login':
                    // when logged in login page must not be accessible
                    resp.redirect('/home');
                    break;

                case '/register':
                    // when logged in register page must not be accessible
                    resp.redirect('/home');
                    break;

                default:
                    resp.render('404',{title:'Page not Found'});
            }
        } else {
            switch(urlContain) {

                case '/':
                        resp.render('index',{title:'Pandiyan\'s website'});
                        break;

                case '/login':
                    resp.render('login',{
                        title:'Pandiyan |Login', 
                        PassWordError : PassWordError,
                        UserNameError : UserNameError,
                        loggedOut : loggedOut
                    });/* providing additional variables success and 
                    errors to validate form using express validators */
                    PassWordError = false;
                    UserNameError = false;
                    loggedOut = false;
                    errors=[];
                    break;

                case '/register':
                    resp.render('register',{
                        title:'Pandiyan |Register',
                        heading : 'Error : Kindly ,please provide valid infomration.',
                        errors : errors,
                        UserNamePresent : UserNamePresent
                    });/* providing additional variables success and 
                    errors to validate form using express validators */
                    errors = false;
                    break;

                default:
                    resp.render('404',{title:'Page not Found'});
            }
        }
    });

    router.post(/^(.+)$/, function(req,resp) {
        urlContain = req.url;
        if(sessions) {
            switch(urlContain) {

                case '/cal':
                    dataInsert ={
                    name: JSON.parse(JSON.stringify(req.body.name)),
                    age: JSON.parse(JSON.stringify(req.body.age)),
                    };
                    resp.render('result',{
                        title:'Result',
                        heading : 'Your name and age is',
                        RegistrationIsCorrect : false,
                        EnteredValue : true,
                        dataInsert: dataInsert
                    });
                    dbapi.initiate.DBDataWritingFunc(dataInsert,'calculator');  // writing to the database
                    break;
    
                case '/logout':
                    sessions = null;
                    loggedOut = true;
                    resp.redirect('/login');
                    break;
    
                default:
                    resp.render('404',{title:'Page not Found'});
            }
        } else {
            switch(urlContain) {
    
                case '/login':
                    upINPUT = [];
                    upINPUT.push(req.body.username,req.body.password);
                    dbpromise = dbapi.initiate.DBDataRetrivingFunc(upINPUT);  // check whether the username/email exists or not
                    dbpromise.then(function(upOUTPUT) {
                        if (upOUTPUT[0] == false) {
                            req.check('username', 'The following <strong>USERNAME</strong> that you have entered <strong>does NOT EXISTS</strong>.').isLength({max: 1}); // from the express validator
                            errors = req.validationErrors(); // validationErrors() from the express validators
                            UserNameError = errors[0]['msg'];
                            resp.redirect('/login');
                        } else {
                            if(upOUTPUT[1] == true) {
                                sessions = req.sessionID;
                                resp.redirect('/home');
                            } else {
                                req.check('password','The <strong>PASSWORD</strong> you have entered is a <strong>INCORRECT</strong> one.').isLength({max: 1});
                                errors = req.validationErrors(); // validationErrors() from the express validators
                                PassWordError = errors[0]['msg'];
                                resp.redirect('/login');   
                            }
                        }
                    },Promise_error_Handler);
                    break;
        
                case '/register':
                    req.check('email', 'INVALID EMAIL ID : Please provide a proper valid email address.').isEmail(); // from the express validator
                    req.check('password1', 'INSUFFICIENT PASSWORD LENGTH  : The Password must be of 8 or more characters.').isLength({min: 8});
                    req.check('password1', 'PASSWORD DOES NOT HAVE NUMBERS.').matches(/[0-9]/,"g");
                    req.check('password1', 'PASSWORD DOES NOT HAVE ALPHABETS.').matches(/[a-zA-Z]/,"g");
                    req.check('password1', 'PASSWORD DOES NOT HAVE SYMBOLS IN THEM.').matches(/[^a-zA-Z0-9]/,"g");
                    req.check('password2', 'PASSWORD DID NOT MATCH : The confirmation Password you entered does not match the first password.').equals(req.body.password1);
                    
                    let requests = [ req.body.name.match(/[^a-zA-Z]/g), req.body.city.match(/[^a-zA-Z]/g), req.body.zip.match(/[^0-9]/g) ];
                    let inputBoxes = ['name','city','zip'];
                    let IBvalues = ['Invalid Name : Name must not contain numbers, special characters, or extra spaces in between',
                    'Invalid City name: The City name must not contain numbers, special characters, or extra spaces in between',
                    'Invalid ZIP Code : The ZIP Code must not contain alphabetic letters, special characters, or extra spaces in between'
                    ];
                    var i;
                    for (i = 0; i < requests.length; i++) {
                        if (requests[i]) {
                            req.check(inputBoxes[i], IBvalues[i]).isEmail();
                        }
                    }
                    req.check('zip','INVALID ZIP CODE : Enter the correct 6 digit ZIP code of your residential area.').isLength({min: 6});
                    errors = req.validationErrors(); // validationErrors() from the express validators
                    
                    if(errors) {
                        resp.redirect('/register');
                    } else {
                        upINPUT = [];
                        upINPUT.push(req.body.email,null);
                        dbpromise = dbapi.initiate.DBDataRetrivingFunc(upINPUT); // check whether the email exists or not
                        dbpromise.then(function(upOUTPUT) {
                            UserNamePresent = upOUTPUT[0];
                            if (upOUTPUT[0] == true) {
                                resp.redirect('/register');
                            } 
                            else {
                                let salt_generator = bcrypt.genSaltSync(10);
                                dataInsert = {
                                name : JSON.parse(JSON.stringify(req.body.name)),
                                email: JSON.parse(JSON.stringify(req.body.email)),
                                password1: bcrypt.hashSync(JSON.parse(JSON.stringify(req.body.password1)), salt_generator),
                                password2: JSON.parse(JSON.stringify(req.body.password2)),
                                salt: salt_generator,
                                address1: JSON.parse(JSON.stringify(req.body.address1)),
                                address2: JSON.parse(JSON.stringify(req.body.address2)),
                                city: JSON.parse(JSON.stringify(req.body.city)),
                                state: JSON.parse(JSON.stringify(req.body.state)),
                                zip: JSON.parse(JSON.stringify(req.body.zip)),
                                checkMeOut: req.body.checkMeOut,
                                };
                                resp.render('result',{title:'Result',heading : 'The Informationn that you have entered are as follows :',
                                    RegistrationIsCorrect : true,EnteredValue : false,dataInsert: dataInsert
                                });
                                dbapi.initiate.DBDataWritingFunc(dataInsert,'signin');  // writing to the database
                            }
                        },Promise_error_Handler);
                    }
                    break;
                default:
                    resp.render('404',{title:'Page not Found'});
            }
        }
    });
}
catch(err) {
    console.log(err);
    resp.writeHead(500,{'Content-Type':'text/plain'});
    resp.render('500',{title:'Internal Server Error',sessionPresent:sessionPresent});
}

module.exports = router;