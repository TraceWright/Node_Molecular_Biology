import express from 'express';
import cors from 'cors';
import * as dna from 'dna';
//import { Pool } from 'pg';
let bodyParser = require('body-parser');
let semaphore = require('semaphore');
const Pool = require('threads').Pool;

var MongoClient = require('mongodb').MongoClient, assert = require('assert');
// Connection URL 
var url = 'mongodb://localhost:27017/node_genetics';

const server = express();
const PORT = 4000;
server.use('*', cors({ origin: 'http://localhost:3000' }));

server.use(bodyParser.json({limit: '100mb'}));
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit:50000 }));

server.post('/stats', function(req, res, next) {
    MongoClient.connect(url).then(function(db) {
        let collection = db.collection('gene_indexes');
        // collection.storageSize(function(err, result) {
        //     console.log(result);
        //     res.send(result);
        // })
    })
});

server.post('/vectors', function(req, res, next) {
    MongoClient.connect(url).then(function(db) {
        let collection = db.collection('annotations');
        let data = JSON.parse(req.body.data);
        console.log(data);
        let sem = semaphore(1);

        for (let i = 0; i < data.length; i++) { 
            for (let j = 0; j < data[i].length - 1; j++) {
                if (data[i][j].tf[0] > 0) {
                    for (let k = 0; k < data[i][j].pos.length; k++) {
                        let pos = data[i][j].pos[k];
                        let posComplement = data[i][j].posComplement[k];
                        sem.take(function() {
                            collection.find({organism: data[i][j].organism, sPos: {$lt:pos}, ePos:{$gt:pos}},
                                {_id:1, strand:1, strand:1, sPos:1, ePos:1, product:1, organism:1}).toArray(function(err, result) { // this callback function creates the query below, therefore the function below isn't created until the results of this function are returned
                                if (result[0] === undefined) {
                                    data[i][j].pos[k] = [pos, {}]
                                }
                                else {
                                    data[i][j].pos[k] = [pos, result[0]]
                                }
                                collection.find({organism: data[i][j].organism, sPos: {$lt:posComplement}, ePos:{$gt:posComplement}},
                                    {_id:1, strand:1, strand:1, sPos:1, ePos:1, product:1, organism:1}).toArray(function(err, result_comp) {
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
                },200)
            } else {
                console.log(data);
                res.send(data);
            }
        };
        timeout();
    })
});

server.post('/annotations', function(req, res, next) {
    
    let data = JSON.parse(req.body.data);
    // console.log('data');
    // console.log(data);

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
    res.sendStatus(200);
    let sa = req.body.sequence;
    let organism = req.body.organism;
    let kmerLength = req.body.kmerLength;
    let rcsa = [];

    // create reverse complement strand
    for (let i = 0; i < sa.length; i++) {
        let rcs = dna.complStrand(sa[i], true);
        rcsa.push(rcs);
    }

    const pool = new Pool();
        
    for (let i_pool = 0; i_pool < sa.length; i_pool++) {

        const poolJob = pool.run(
            function(input, done) {

            let sa = input.sa;
            let ant = input.organism;
            let kmerLength = input.kmerLength;
            let rcsa = input.rcsa; 
            let i = input.i;
            let newIndex = [];
        
                let sequenceLength = sa[i].length;
                
                let sequenceArray = [];
                sequenceArray.push(sa[i], rcsa[i]);
                let strand = '';        
                let cra = {};
                let ta = [];
                let t = [];
                let c = [];
        
                // tokeniseSequences
                for (let j = 0; j < 2; j++) {
                    let tok = sequenceArray[j].replace('/,/g' , '');
                    let regex = new RegExp(`.{1,${kmerLength}}`, "g");
                    ta[j] = tok.match(regex);
                    j === 0 ? t[0] = ta[j]: c[0] = ta[j]; // element one of rotations array                    
                }
                
                // createRotations
                let prev = '';
                let ql = ta[0][0].length;
            
                for (let n = 1; n < ql; n++) {
                    t[n] = [];
                    prev = '';
                    for (let k = 0; k < ta[0].length - 1; k++) {
                        let current = ta[0][k].slice(0, ql-n);
                        t[n][k] = `${prev}${current}`
                        prev = ta[0][k].slice(ql-n, ql);
                    } 
                }

                for (let n = 1; n < ql; n++) {
                    c[n] = [];
                    prev = '';
                    for (let k = 0; k < ta[1].length - 1; k++) {
                        let current = ta[1][k].slice(0, ql-n);
                        c[n][k] = `${prev}${current}`
                        prev = ta[1][k].slice(ql-n, ql);
                    } 
                }

                cra['t'] = t;
                cra['c'] = c;
        
                        let index = {};
                        let i_main = 0;  // artifact from methods which process multiple documents into 1 index
                        
                        for (strand in cra) {
                            console.log(strand);
                            let ra = cra[strand];
        
                            let queryLength = ra.length;
                            let positionStart;
                            
                            for (let j = 0; j < ra.length; j++) {
                                for (let i = 0; i < ra[j].length; i++) {
                                    positionStart = 0 + (i * queryLength); // TODO: 0 is hardcoded currently for rotNumber
                                    if (!index.hasOwnProperty(ra[j][i])) {
                                        index[ra[j][i]] = [[i_main, 1 , [[positionStart, strand]]]]
                                    } else {
                                        let match = -1;
                                        for (let l = 0; l < index[ra[j][i]].length; l++) {
                                            if (i_main === index[ra[j][i]][l][0]) {
                                                match = l;
                                            }
                                        }
                                        if (match < 0) {
                                            index[ra[j][i]].push([i_main, 1, [[positionStart, strand]] ]);                   
                                        } else {
                                            index[ra[j][i]][match][1] += 1;
                                            index[ra[j][i]][match][2].push([positionStart, strand]); 
                                        }    
                                    }  
                                }
                            }
                        }     
            for (let kmer in index) {
                newIndex.push({ k: kmer, d: index[kmer] });
            }
            newIndex.push({ organism: ant[i] });
            newIndex.push({ seqLen: sequenceLength });

        done({ index: newIndex, i: i }, input);
        }).send({  sa: sa, organism: organism, kmerLength: kmerLength, rcsa: rcsa, i: i_pool });
    }

        pool
        .on('done', function(job, message) {
        console.log('Job done: {}');
        let organism = Buffer.from(message.index[message.index.length - 2].organism).toString('base64');
        sendIndex(message.index, organism, message.i);
        })
        .on('error', function(job, error) {
            console.error('Job errored:', job);
            })
        .on('finished', function() {
        console.log('Everything done, shutting down the thread pool.');
        pool.killAll();
        });
   
});


function sendIndex(index, organism, i) {

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        let collection = db.collection(`kmers_${i}_${organism}`);
        collection.insertMany(index, function(err, result) {
            assert.equal(err, null);
            console.log("Updated the document");
            db.close();
        });  
    });
}




server.post('/query', function(req, res, next) {    
    MongoClient.connect(url, function(err, db) { 
        assert.equal(null, err);

        db.listCollections().toArray(function(err, collInfos) {
            let kmer_matches = [];
            let sem = semaphore(1);
            collInfos.forEach(function(element) {
                if (element.name.indexOf("kmers_") != -1) {
                    sem.take(function() {
                        let collection = db.collection(element.name);
                        console.log(req.body.data);
                        collection.find({k: { $in: req.body.data }},{_id: 0, k:1, d:1, strand:1}).toArray(function(err, result) {
                            assert.equal(err, null);
                            console.log("Found the following records");
                            console.log(result);
                            collection.findOne({'seqLen':{$ne:null}},{_id: 0, seqLen:1}, function(err, seqLen) {
                                assert.equal(err, null);
                                result.push(seqLen);
                                collection.findOne({'organism': {$ne:null}},{_id: 0, organism:1}, function(err, org) {
                                    assert.equal(err, null);
                                    result.push(org);
                                    kmer_matches.push(result);
                                    sem.leave();
                                }); 
                            });
                        });       
                    });
                }
            });
            let timeout = function() {
                if(sem.available() == false) {
                    setTimeout(function() {
                        timeout();
                    },200)
                } else {
                    res.send(JSON.stringify(kmer_matches));
                }
            };
            timeout();
        });
    });
});

server.post('/cleardb', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);      
        db.listCollections().toArray(function(err, collInfos) {
            collInfos.forEach(function(element) {
                db.collection(element.name).drop()
                console.log(element.name + ' dropped')
            });
            // db.close();
        });

        res.sendStatus(200);
    });
});


server.listen(PORT, () => 
console.log(`Server is now running on http://localhost:${PORT}`)
);