const fs = require('fs');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var formidable = require('formidable');
var nodemailer = require('nodemailer');

var errors;
var rog;
var text = {};
var dbpromise;
var upINPUT = [];
var dataInsert = {};
var PassWordError;
var UserNameError;
var urlContain;
var UserNamePresent;
var loggedOut;

const dbapi = require('./dbapi.js');

var Promise_error_Handler = function(err) {
    console.log(err);
}

router.get(/^(.+)$/, function(req,resp) {
    urlContain = req.url;
    if(req.session.views) {
        req.session.views++;
        switch(urlContain) {
            case '/home':
                resp.render('home',{title:'Home'});
                break;
            case '/cal':
                resp.render('cal',{title:'Printing calculator'});
                break;
            case '/fileupload':
                resp.render('fileupload',{title:'File upload'});
                break;
            case '/about':
                resp.render('about',{title:'About us'});
                break;
            case '/contact':
                resp.render('contact',{title:'Contact us'});
                break;
            case '/':
                resp.redirect('/home');
                break;
            case '/login':
                resp.redirect('/home');
                break;
            case '/register':
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
                });
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
                    text: text,
                    UserNamePresent : UserNamePresent
                });
                errors = false;
                break;
            default:
                resp.render('404',{title:'Page not Found'});
        }
    }
});



router.post(/^(.+)$/, function(req,resp) {
    urlContain = req.url;
    if(req.session.views) {
        req.session.views++;
        switch(urlContain) {
            case '/cal':
                dataInsert ={
                name: JSON.parse(JSON.stringify(req.body.name)),
                age: JSON.parse(JSON.stringify(req.body.age)),
                };
                rog = "<h3>Your name and age is.</h3>";
                resp.render('result',
                {
                    title:'Result',
                    heading : rog,
                    RegistrationIsCorrect : false,
                    EnteredValue : true,
                    dataInsert: dataInsert
                });
                dbapi.initiate.DBDataWritingFunc(dataInsert,'calculator');
                break;

            case '/fileupload':
                var form = new formidable.IncomingForm();

                form.parse(req, function(err, fields, file) {});
                form.on('file', function (name, file){
                    if(file.size > 0){

                        var oldpath = "/"+file.path;
                        var newpath = __dirname + '/data';

                        if (fs.existsSync('/data')) {
                            
                            fs.copyFileSync(oldpath, newpath);
                            rog = '<img src="'+ oldpath +'" alt="image">';                               
                                resp.render('result',
                                {
                                    title:'Result',
                                    heading : rog,
                                    RegistrationIsCorrect : false,
                                    EnteredValue : true,
                                    dataInsert: false
                                });

                            fs.rename(oldpath, newpath, function (err) {});
                        } else {
                            
                            fs.mkdirSync('data', (err) => {
                                if (err) throw err;
                            });

                            fs.copyFile(oldpath, newpath, (err) => {
                                if (err) throw err;
                                rog = '<img src="'+ newpath +'" alt="image">';                               
                                resp.render('result',
                                {
                                    title:'Result',
                                    heading : rog,
                                    RegistrationIsCorrect : false,
                                    EnteredValue : true,
                                    dataInsert: false
                                });
                            });

                            fs.rename(oldpath, newpath, function (err) {});
                        }
                    } else {
                        rog = "<h3>No Data was uploaded broo...!!</h3>";
                        resp.render('result',
                            {
                                title:'Result',
                                heading : rog,
                                RegistrationIsCorrect : false,
                                EnteredValue : true,
                                dataInsert: false
                            });
                    }
                });
                break;

            case '/contact':
                const output = `
                <p>You have a new contact request</p>
                <h3>Contact Details</h3>
                <ul>  
                <li>Name: ${req.body.name}</li>
                <li>Company: ${req.body.company}</li>
                <li>Email: ${req.body.email}</li>
                <li>Phone: ${req.body.phone}</li>
                </ul>
                <h3>Message</h3>
                <p>${req.body.message}</p>`;

                let transporter = nodemailer.createTransport({
                    host: 'mail.pandiyan.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'YOUREMAIL',
                        pass: 'YOURPASSWORD'
                    },

                    tls:{
                    rejectUnauthorized:false
                    }
                });

                let mailOptions = {
                    from: '"Nodemailer Contact" <your@email.com>',
                    to: 'RECEIVEREMAILS', 
                    subject: 'Node Contact Request', 
                    text: 'Hello world?', 
                    html: output 
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) throw error;
                    console.log('Message sent: %s', info.messageId);   
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                    rog = "<h3>",nodemailer.getTestMessageUrl(info),"</h3>","<h3>",req.body,"</h3>";
                    resp.render('result',
                    {
                        title:'Result',
                        heading : rog,
                        RegistrationIsCorrect : false,
                        EnteredValue : true,
                        dataInsert: false
                    });
                });

                break;

            case '/logout':
                req.session.destroy(function(err) {});
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
                dbpromise = dbapi.initiate.DBDataRetrivingFunc(upINPUT);
                dbpromise.then(function(upOUTPUT) {     

                    if (upOUTPUT[0] == false) {
                        req.check('username', 'The following <strong>USERNAME</strong> that you have entered <strong>does NOT EXISTS</strong>.').isLength({max: 1}); 
                        errors = req.validationErrors(); 
                        UserNameError = errors[0]['msg'];
                        resp.redirect('/login');
                    } else {
                        if(upOUTPUT[1] == true) {
                            req.session.views = 1;
                            resp.redirect('/home');
                        } else {
                            req.check('password', 'The <strong>PASSWORD</strong> you have entered is a <strong>INCORRECT</strong> one.').isLength({max: 1});
                            errors = req.validationErrors();
                            PassWordError = errors[0]['msg'];
                            resp.redirect('/login');   
                        }
                    }
                },Promise_error_Handler);
                break;
    
            case '/register':
                req.check('email', 'INVALID EMAIL ID : Please provide a proper valid email address.').isEmail(); 
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
                    } else {
                        console.log("The value number of 'i' is :-",i);
                    }
                }
                req.check('zip','INVALID ZIP CODE : Enter the correct 6 digit ZIP code of your residential area.').isLength({min: 6});

                errors = req.validationErrors();
                if(errors) {
                    text = {};
                    for (i = 0; i < errors.length; i++) {
                        text[errors[i]['param']] = errors[i]['msg'];
                    }
                    resp.redirect('/register');
                } else {
                    upINPUT = [];
                    upINPUT.push(req.body.email,null);
                    dbpromise = dbapi.initiate.DBDataRetrivingFunc(upINPUT); 
                    dbpromise.then(function(upOUTPUT) {
                        UserNamePresent = upOUTPUT[0];
                        
                        if(req.body.checkMeOut == 'on') {
                            console.log("the checked box is ticked");
                        } else {
                            console.log("the checked box is not ticked");
                        }
        
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
                            rog = "";
                            resp.render('result',
                            {
                                title:'Result',
                                heading : rog,
                                RegistrationIsCorrect : true,
                                EnteredValue : false,
                                dataInsert: dataInsert
                            });
                            dbapi.initiate.DBDataWritingFunc(dataInsert,'signin');
                        }
                    },Promise_error_Handler);
                }
                break;
            default:
                
                resp.render('404',{title:'Page not Found'});
        }
    }
});

module.exports = router;
