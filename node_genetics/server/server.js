import express from 'express';
import cors from 'cors';
//import { Pool } from 'pg';
let bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient, assert = require('assert');
// Connection URL 
var url = 'mongodb://localhost:27017/node_genetics';

const server = express();
const PORT = 4000;
server.use('*', cors({ origin: 'http://localhost:3000' }));

server.use(bodyParser.json({limit: '100mb'}));
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit:50000 }));

server.post('/index', function(req, res, next) {
    
    let data = JSON.parse(req.body.data);
    //console.log(data);

    // Use connect method to connect to the Server 
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        let collection = db.collection('gene_indexes');
        //db.<collection(like a table)>('<tableName>');
        collection.insertMany(data, function(err, result) {
            assert.equal(err, null);
            console.log("Updated the document");
            db.close();
            res.sendStatus(200);
          });  
    });
    
   // db.gene_indexes.find({k: "AAAATT"})

    // res.sendStatus(200);
})


server.post('/query', function(req, res, next) {
    console.log(req.body);
    
    MongoClient.connect(url, function(err, db) { 
        assert.equal(null, err);
        let collection = db.collection('gene_indexes');
        // collection.find({k: req.body.data},{_id: 0, k:1,d:1}).toArray(function(err, result) { 
        collection.find({k: { $in: req.body.data }},{_id: 1, k:1, d:1}).toArray(function(err, result) {
            assert.equal(err, null);
            //assert.equal(1, result.length);
            console.log("Found the following records");
            console.dir(result);
            res.send(JSON.stringify(result));
          });        
        db.close(); 
    });

    //res.sendStatus(200);
})


// const pgPool = new Pool({
//     database: 'adventureworks',
//     user: 'tracey',
//     password: 'password',
//     host: 'localhost',
//     port: 5432, 
//     postgraphql: {
//         schema: 'person',  
//     }
// });


// server.get('/person', function(req, res){
//   pgPool.query('Select * from person.person limit 100').then(function(data){
//     console.log(data);
//     res.send(data);
//   }, function(err){res.send(500,{error: err})})
// });

// server.use(postgraphql('postgres://tracey:password@localhost:5432/adventureworks'));


server.listen(PORT, () => 
console.log(`Server is now running on http://localhost:${PORT}`)
);