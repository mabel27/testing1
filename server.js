var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();


app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());


app.get('/listing',function(req,res) {
    
     pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     
     if (err) console.error(err);
        
        var select = 'SELECT sfid, Name, date__c,subscription__c, number__c FROM salesforce.IT_Software_Type__c ';
        conn.query(select, function(err, result) {
          
           if (err) {
               
                res.send('Error in Query');
        
           }
            res.json(result);
            
            });
        });

});


app.get('/softwareName',function(req,res) {
    
    
  //  res.json({user: 'mabel'});

    
     pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     
     if (err) console.error(err);
        
        var select = 'SELECT sfid, Name FROM salesforce.IT_Software_Type__c WHERE number__c = 0 ';
        conn.query(select, function(err, result) {
          
           if (err) {
               
                res.send('select');
        
           }
            res.json(result);
            
           
            });
        });

});


app.post('/updateSoftware', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
        if (err) console.log(err);
        
        var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1  WHERE sfid = $2';
        conn.query(update,[req.body.number__c, req.body.sfid],
                
                
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
    });
});


app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
        if (err) console.log(err);
        
        var update = 'UPDATE salesforce.IT_Software_Type__c SET number__c = $1  WHERE sfid = $2';
        conn.query(update,[req.body.number__c, req.body.sfid],
                

        function(err, result) {
                        
            done();
                        
            if (err) {
                        
                res.status(400).json({error: err.message});
            }
             else {
                    res.json(result);
                }
                  });
            
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

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