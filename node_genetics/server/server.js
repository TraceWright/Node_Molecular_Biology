import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
let bodyParser = require('body-parser');


const server = express();
const PORT = 4000;
server.use('*', cors({ origin: 'http://localhost:3000' }));

server.use(bodyParser.json({limit: '100mb'}))
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit:50000 }))

const pgPool = new Pool({
    database: 'adventureworks',
    user: 'tracey',
    password: 'password',
    host: 'localhost',
    port: 5432, 
    postgraphql: {
        schema: 'person',  
    }
});



server.post('/index', function(req, res, next) {
    console.log(req.body);
    res.sendStatus(200);
})


server.get('/person', function(req, res){
  pgPool.query('Select * from person.person limit 100').then(function(data){
    console.log(data);
    res.send(data);
  }, function(err){res.send(500,{error: err})})
});

// server.use(postgraphql('postgres://tracey:password@localhost:5432/adventureworks'));


server.listen(PORT, () => 
console.log(`GraphQL Server is now running on http://localhost:${PORT}`)
);