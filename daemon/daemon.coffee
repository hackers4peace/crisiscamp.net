http = require 'http'
express = require 'express'
cors = require 'cors'
request = require 'superagent'

daemon = express()
daemon.use cors()
daemon.use express.bodyParser()
daemon.use express.static(__dirname.replace('daemon', 'public'))

daemon.post '/auth/login', (req, res) ->
  request.post('https://verifier.login.persona.org/verify')
    .send
      assertion: req.body.assertion
      audience: 'http://localhost:9000'
    .end (vres) ->
      console.log vres.body
      res.json vres.body

daemon.post '/auth/logout', (req, res) ->
  console.log req.body.assertion
  res.send 200

daemon.get '/:city/:shortDate?', (req, res) ->
  res.sendfile __dirname.replace('daemon', 'public/index.html')

server = http.createServer daemon
server.listen 9000
