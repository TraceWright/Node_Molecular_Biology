import express from 'express';
import cors from 'cors';
//import { Pool } from 'pg';
let bodyParser = require('body-parser');
let semaphore = require('semaphore');

var MongoClient = require('mongodb').MongoClient, assert = require('assert');
// Connection URL 
var url = 'mongodb://localhost:27017/node_genetics';

const server = express();
const PORT = 4000;
server.use('*', cors({ origin: 'http://localhost:3000' }));

server.use(bodyParser.json({limit: '100mb'}));
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit:50000 }));

server.post('/vectors', function(req, res, next) {
    MongoClient.connect(url).then(function(db) {
        let collection = db.collection('annotations');
        let data = JSON.parse(req.body.data);
        let sem = semaphore(1);

        for (let i = 0; i < data.length; i++) { 
            for (let j = 0; j < data[i].length - 1; j++) {
                if (data[i][j].tf[0] > 0) {
                    for (let k = 0; k < data[i][j].pos.length; k++) {
                        let pos = data[i][j].pos[k];
                        let posComplement = data[i][j].posComplement[k];
                        sem.take(function() {
                            collection.find({organism: data[i][j].organism, sPos: {$lt:pos}, ePos:{$gt:pos}},
                                {_id:1, strand:1, strand:1, ePos:1, product:1, organism:1}).toArray(function(err, result) {
                                if (result[0] === undefined) {
                                    data[i][j].pos[k] = [pos, {}]
                                }
                                else {
                                    data[i][j].pos[k] = [pos, result[0]]
                                }
                                collection.find({organism: data[i][j].organism, sPos: {$lt:posComplement}, ePos:{$gt:posComplement}},
                                    {_id:1, strand:1, strand:1, ePos:1, product:1, organism:1}).toArray(function(err, result_comp) {
                                        if (result_comp[0] === undefined) {
                                            data[i][j].posComplement[k] = [posComplement, {}]
                                        }
                                        else {
                                            data[i][j].posComplement[k] = [posComplement, result_comp[0]]
                                        }
                                sem.leave();
                                });
                            });
                        });
                    }
                }
            }
        }
        let timeout = function() {
            if(sem.available() == false) {
                setTimeout(function() {
                    timeout();
                },50)
            } else {
                res.send(data);
            }
        };
        timeout();
    })
});

server.post('/annotations', function(req, res, next) {
    
    let data = JSON.parse(req.body.data);
    console.log('data');
    console.log(data);

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        let collection = db.collection('annotations');
        //db.<collection(like a table)>('<tableName>');
        collection.insertMany(data, function(err, result) {
            assert.equal(err, null);
            console.log("Updated the document");
            db.close();
            res.sendStatus(200);
          });  
    });
});

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
});


server.post('/query', function(req, res, next) {    
    MongoClient.connect(url, function(err, db) { 
        assert.equal(null, err);
        let collection = db.collection('gene_indexes');
        collection.find({k: { $in: req.body.data }},{_id: 0, k:1, d:1}).toArray(function(err, result) {
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(result);
            collection.findOne({'seqLen':{$ne:null}},{_id: 0, seqLen:1}, function(err, seqLen) {
                assert.equal(err, null);
                result.push(seqLen);
                collection.findOne({'organisms': {$ne:null}},{_id: 0, organisms:1}, function(err, org) {
                    assert.equal(err, null);
                    result.push(org);
                    res.send(JSON.stringify(result));
                    db.close();
                }); 
            });
        });
    });
});

server.post('/cleardb', function(req, res, next) {
    MongoClient.connect(url, function(err, db) { 
        assert.equal(null, err);
        let collection = db.collection('gene_indexes');
        let annotation = db.collection('annotations')
        collection.remove({});
        annotation.remove({});
        db.close(); 
        res.sendStatus(200);
    });
});


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