var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Auth0Strategy = require('passport-auth0');
//var strategy = require('./setup-passport');

var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  process.env.AUTH0_CALLBACK_URL || 'https://test09152015.herokuapp.com/callback'
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = strategy;


app.set('port', process.env.PORT || 5000);
app.use(express.static('public'));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({ secret: 'shhhhhhhhh' }));
app.use(passport.initialize());
app.use(passport.session());




// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/test09152015.herokuapp.com' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/user");
  });


app.get('/user', function (req, res) {
  res.render('user', {
    user: req.user
  });
});

/***********************************************************************************************
GET-/Listing: Find the fields from the custom object and display it in the form (index.html)
************************************************************************************************/
app.get('/listing',function(req,res) {
    
     pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     
     if (err) console.error(err);
        
        var select = 'SELECT sfid, Name, date__c,subscription__c, number__c FROM salesforce.IT_Software_Type__c ORDER BY Name ASC ';
        conn.query(select, function(err, result) {
          
           if (err) {
               
                res.send('Error in Query');
        
           }
            res.json(result);
            
            });
        });
});



/******************************************************************************************************
GET-/softwareName: Display the Software name that does not have licenses
******************************************************************************************************/
app.get('/softwareName',function(req,res) {

     pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     
     if (err) console.error(err);
        
        var select = 'SELECT sfid, Name FROM salesforce.IT_Software_Type__c WHERE number__c = 0 ORDER BY Name ASC ';
        conn.query(select, function(err, result) {
          
           if (err) {
               
                res.send('select');
        
           }
            res.json(result);
         
            });
        });
});


/***********************************************************************************************************
POST-/updateSoftware: Receive the form from the client side and update the record in the database/salesforce
************************************************************************************************************/
app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
        if (err) console.log(err);
        
     /*   var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1, externalid__c = $2   WHERE sfid = $3';
        conn.query(update,[req.body.number__c, req.body.sfid, req.body.externalid__c],
       function(err, result) {
                done();
                if (err != null || result.rowCount == 0) {
                     console.error(err);
                    res.status(400).json({error: err});
                }
                else {
                    res.json(result);
                }
            }
            
        );
        */
        
        //IT_Software_Type__c__ExternalId__c
          var insert = 'INSERT INTO salesforce.IT_Software__c (number__c) VALUES ($1)';
                    
            conn.query(insert,[req.body.number__c],function(err, result) {
                done();
                if (err != null || result.rowCount == 0) {
                    console.error(err);
                    res.status(400).json({error: err});
                }
                else {
                    res.json(result);
                }
            }
            
        );    
            
    });
});


/*********************************************************************************************************
POST-/create: Receive the form from the client side and create a new record in the database/salesforce
**********************************************************************************************************/
app.post('/create', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
        if (err) console.log(err);
        
       // var update = 'SELECT sfid FROM salesforce.IT_software_Type__c WHERE Name = $2';
        
         var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1, date__c = $3, subscription__c =$4  WHERE LOWER(Name) = LOWER($2)';
        
        conn.query(update,[req.body.number__c, req.body.name, req.body.date__c, req.body.subscription__c],function(err, result) {
                
        if (err != null || result.rowCount == 0) {
                    
            var insert = 'INSERT INTO salesforce.IT_Software_Type__c (number__c, Name , date__c, subscription__c) VALUES ($1, $2, $3, $4)';
                    
            conn.query(insert,[req.body.number__c, req.body.name, req.body.date__c, req.body.subscription__c],
    
                  function(err, result) {
                        
                    done();
                        
                    if (err) {
                        
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    
                    
                    done();
                    res.json(result);
                }
            }
        );
    });
});


/****************************************************************************************************************
POST-/new: Create a new contact record in the database/salesforce (Testing functionality)
*****************************************************************************************************************/
app.post('/new', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
        var insert = 'INSERT INTO salesforce.Contact(LastName) VALUES($1)';
            conn.query(insert,[req.body.LastName],
            function(err, result) {
                done();
                if (err != null || result.rowCount == 0) {
                     console.error(err);
                    res.status(400).json({error: 'Error inserting'});
                }
                else {
                    res.json(result);
                }
            }
            
        );
            
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});