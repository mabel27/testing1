var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/new', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        conn.query(
            'INSERT INTO salesforce.IT_Software_Type INTO (softwareName,date,subscription,numberOfLicenses) VALUES(softwareName,date,subcription,number)',
            [req.body.softwareName, req.body.number],
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
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});