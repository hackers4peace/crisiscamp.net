var http = require('http');
var express = require('express');
var cors = require('cors');
var superagent = require('superagent');

var daemon = express();
daemon.use(cors());
daemon.use(express.bodyParser());
daemon.use(express.static(__dirname.replace('daemon', 'public')));

daemon.post('/auth/login', function(req, res){
  superagent.post('https://verifier.login.persona.org/verify')
    .send({
      assertion: req.body.assertion,
      audience: 'http://localhost:9000'
    })
    .end(function(vres){
      console.log(vres.body);
      res.json(vres.body);
    });
});

daemon.post('/auth/logout', function(req, res){
  console.log(req.body.assertion);
  res.send(200);
});

daemon.get('/:city/:shortDate?', function(req, res){
  res.sendfile(__dirname.replace('daemon', 'public/index.html'));
});

var server = http.createServer(daemon);
server.listen(9000);
