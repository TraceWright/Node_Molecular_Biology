import express from 'express';
import cors from 'cors';
import * as dna from 'dna';
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


// server.use(function (req, res, next) {
//     getRawBody(req, {
//       length: req.headers['content-length'],
//       limit: '100mb',
//       encoding: contentType.parse(req).parameters.charset
//     }, function (err, string) {
//       if (err) return next(err)
//       req.text = string
//       next()
//     })
//   })

function tokeniseSequence(s, len) {
    let tok = s.replace('/,/g' , '');
    let regex = new RegExp(`.{1,${len}}`, "g");
    let tokArray = tok.match(regex);
    // let tokArray = tok.match(/.{1,7}/g);
    return tokArray;
}

function createRotations(seqArr) {
    let prev = '';
    let rotationArr = [];
    let ql = seqArr[0].length;

    rotationArr[0] = seqArr;
    for (let i = 1; i < ql; i++) {
        rotationArr[i] = [];
        prev = '';
        for (let j = 0; j < seqArr.length - 1; j++) {
            let current = seqArr[j].slice(0, ql-i);
            rotationArr[i][j] = `${prev}${current}`
            prev = seqArr[j].slice(ql-i, ql);
          }      
        }
    return rotationArr;
}

function createComplementStrand(sequence) {
    let complement = dna.complStrand(sequence, true);
    return complement;
}

function processSequences(templateSequence, revCompSequence, sequenceLength, ant, kmerLength) {
    let sequenceArray = [];
    sequenceArray.push(templateSequence, revCompSequence);
    let strand = '';        
    let revComp;
    let cra = {};

    for (let i = 0; i < 2; i++) {
        let ta = tokeniseSequence(sequenceArray[i], kmerLength);
        let r = createRotations(ta);
        i === 0 ? strand = 't': strand = 'c';
        cra[strand] = r;
    }

                let index = {};
                let i_main = 0;  // artifact from methods which process multiple documents into 1 index

                for (strand in cra) {
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
            return index;
        }

server.post('/index', function(req, res, next) {
    let sa = req.body.sequence;
    let organism = req.body.organism;
    let kmerLength = req.body.kmerLength;
    console.log(organism);
    let rcsa = createComplementStrand(sa);
    let sequenceLength = sa.length;
    let index = processSequences(sa, rcsa, sequenceLength, organism, kmerLength); 
    let newIndex = [];      
    
     for (let kmer in index) {
                newIndex.push({ k: kmer, d: index[kmer] });
            }
            console.log("woooo we're half way there");
            newIndex.push({ organisms: organism });
            newIndex.push({ seqLen: sequenceLength });
            console.log('Sending..');

    organism = Buffer.from(organism).toString('base64');
    console.log('newIndex');
    console.log(newIndex);
    
    console.log('organism');
    console.log(organism);
    
    // Use connect method to connect to the Server 
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        let collection = db.collection(`kmers_${organism}`);
        //db.<collection(like a table)>('<tableName>');
        collection.insertMany(newIndex, function(err, result) {
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

        db.listCollections().toArray(function(err, collInfos) {
            let kmer_matches = [];
            let sem = semaphore(1);
            collInfos.forEach(function(element) {
                if (element.name.indexOf("kmers_") != -1) {
                    // kmer_collection.push(element);
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
                                collection.findOne({'organisms': {$ne:null}},{_id: 0, organisms:1}, function(err, org) {
                                    assert.equal(err, null);
                                    result.push(org);
                                    kmer_matches.push(result);
                                    // res.send(JSON.stringify(result));
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
             
        // let collection = db.collection('gene_indexes');
        // console.log(req.body.data);
        // collection.find({k: { $in: req.body.data }},{_id: 0, k:1, d:1, strand:1}).toArray(function(err, result) {
        //     assert.equal(err, null);
        //     console.log("Found the following records");
        //     console.log(result);
        //     collection.findOne({'seqLen':{$ne:null}},{_id: 0, seqLen:1}, function(err, seqLen) {
        //         assert.equal(err, null);
        //         result.push(seqLen);
        //         collection.findOne({'organisms': {$ne:null}},{_id: 0, organisms:1}, function(err, org) {
        //             assert.equal(err, null);
        //             result.push(org);
        //             res.send(JSON.stringify(result));
        //             db.close();
        //         }); 
        //     });
        // });
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