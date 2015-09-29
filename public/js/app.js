var apiVersion = 'v30.0',
clientId = '3MVG9KI2HHAq33RyxiQvWKh1_dXf93uPDkDWUMddH0T3AoOHR_ZZIqL.eM9Y.lbvANgewQGYkd3Sjzs_EkVzg',
loginUrl = 'https://login.salesforce.com/',
redirectURI = 'https://test09152015.herokuapp.com',
proxyURL = 'http://localhost:5000/proxy/',
client = new forcetk.Client(clientId, loginUrl, proxyURL);

function login() {
    var url = loginUrl + 'services/oauth2/authorize?display=popup&response_type=token'
                + '&client_id=' + encodeURIComponent(clientId)
                + '&redirect_uri=' + encodeURIComponent(redirectURI);
    window.open(url);
}

function oauthCallback(response) {
    if (response && response.access_token) {
        client.setSessionToken(response.access_token,
                               apiVersion,
                               response.instance_url);
        console.log('OAuth authentication succeeded');
        //etSessions();
    } else {
        alert("AuthenticationError: No Token");
    }
}

login();