var mongo = require('mongodb').MongoClient
var arg = parseInt(process.argv[2])
var docArray = [];
var url = 'mongodb://localhost:27017/learnyoumongo'
mongo.connect(url, function(err, db) {
    var parrotsCollection = db.collection('parrots')
    parrotsCollection.find({ age: { $gt: arg } }).toArray(function(err, documents) {
        if (err)
            throw err
        console.log(documents)
        db.close()
    })

})