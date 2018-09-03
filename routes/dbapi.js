
var dbo; // stores the database's name
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const url = "mongodb://localhost:27017/";

var upINPUT = []; // consists of the input from the promise
var upOUTPUT = []; // consists of the output that is to be given to the promise
var dataInsert = {}; // holds the data that is to be written in the database
const dbapi_methods={};


// "Data base Data writing function"
dbapi_methods.DBDataWritingFunc = function (dataInsert,coll) {
  console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
  /* This function writes data to the respective 
  collection within the database when called */
  MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    try {
      dbo = db.db("NodeWebsiteDB");
      dbo.collection(coll).insertOne(dataInsert, function(err, res) {
        if (err) {
          throw err;
        } else {
          console.log(res);
        }
        db.close();
      });
    } catch(err) {
      console.log(err);
    };
  });
}


// "Data base Data retriver function"
dbapi_methods.DBDataRetrivingFunc = function (upINPUT) {
  return new Promise(function(resolve,reject) {
    var UserNamePresent;
    var PassWordPresent;
    /* This function retrives the requested data
    from the "signin" collection in the database */
    MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
      dbo = db.db("NodeWebsiteDB");
      dbo.collection('signin').findOne({email:upINPUT[0]}, function(err, result) {
        if (result == null) {
          UserNamePresent = false;
        } else {
          UserNamePresent = true;
          if (upINPUT[1] == null)
          {
            PassWordPresent = null;
          }
          else {
            if(bcrypt.hashSync(upINPUT[1],result.salt) == result.password1) {
              PassWordPresent = true;
            } else {
              PassWordPresent = false;
            }
          }
        }
        db.close();
        if (err) {
          return reject(" THERE IS A ERROR IN THE PROMISE ");
        } else {
          upOUTPUT = [];
          upOUTPUT.push(UserNamePresent,PassWordPresent);
          return resolve(upOUTPUT);
        }
      });
    });
  });
}


exports.initiate = dbapi_methods;
// "initiate" is just a word that i provided so that this exported functions can be used
// in some other file using this "inititate" key word.