var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        
      conn.query(
            'UPDATE salesforce.IT_Software_Type__c SET number__c = $1  WHERE LOWER(Name) = LOWER($2)',
        [req.body.number__c,req.body.softwareName],
        
            function(err, result) {
                done();
                if (err != null || result.rowCount == 0) {
                    res.status(400).json({error: 'The specified contact was not found.'});
                }
                else {
                    res.json(result);
                }
            }
        );

    if(err) 
        
        console.error(err);
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