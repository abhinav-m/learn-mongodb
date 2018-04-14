var mongo = require('mongodb').MongoClient
var arg = parseInt(process.argv[2])

var url = 'mongodb://localhost:27017/learnyoumongo'
mongo.connect(url, function(err, db) {
    var parrotsCollection = db.collection('parrots')
    parrotsCollection.find({
        age: {
            $gt: +arg
        }
    }, {
        name: 1,
        age: 1,
        _id: 0
    }).toArray(function(err, documents) {
        if (err)
            throw err
        console.log(documents)
        db.close()
    })
})