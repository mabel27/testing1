var express = require('express'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
   //methodOverride = require('method-override'),
    
    app = express();

    appId = process.env.APP_ID;

var pg = require('pg');
//var jsforce = require('jsforce');
//var conn = new jsforce.Connection();


//app.use(express.static('public'));

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/appid', function(req, res) {
    res.send({appId: appId});
});


//app.use(methodOverride());

/***********************************************************************************************
Authetication 
************************************************************************************************/

app.all('*', function(req,res, next){

     var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        request({ url: targetURL + req.url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
            }).pipe(res);

});

app.set('port', process.env.PORT || 5000);

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
        
     var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1, externalid__c = $2   WHERE sfid = $3';
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
        
        //IT_Software_Type__c__ExternalId__c
        //IT_Software_Type__r__ExternalId__c
        //IT_Software_Type__c
        
        
        
          var insert = 'INSERT INTO salesforce.IT_Software__c (IT_Software_Type__c,number__c) VALUES ($1,$2)';
                    
            conn.query(insert,[req.body.IT_Software_Type__c,req.body.number__c],function(err, result) {
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