var https = require('https');

/**
 * Send request to DO
 * @param { {url: string, method:string, token:string, data: {}}} cnf
 * @param {function} cb
 * @param {function} eb
 */
module.exports = function(cnf, cb, eb) {

  var options = {
    hostname: 'api.digitalocean.com',
    port: 443,
    path: '/v2/' + (cnf.url !== undefined ? cnf.url : ''),
    method: (cnf.method !== undefined ? cnf.method : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + cnf.token
    }
  };

  var postData;
  if (cnf.data !== undefined) {
    postData = JSON.stringify(cnf.data);
    options.headers['Content-Length'] = postData.length;
  }

  var req = https.request(options, function(res) {

    res.on('data', function(d) {
      cb(JSON.parse(d.toString()), res.statusCode);
    });
  });

  if (postData !== undefined) {
    req.write(postData);
  }
  req.end();

  req.on('error', function(e) {
    eb(JSON.parse(e.toString()));
  });
};
