var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();


app.set('port', process.env.PORT || 5000);
app.use(express.static('public'));
app.use(bodyParser.json());


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
        
        var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1  WHERE sfid = $2';
        conn.query(update,[req.body.number__c, req.body.sfid],
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
        
          var insert = 'INSERT INTO salesforce.IT_Software__c (IT_Software_Type__c__ExternalId__c ,number__c) VALUES ($1, $2)';
                    
            conn.query(insert,[req.body.sfid, req.body.number__c],function(err, result) {
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