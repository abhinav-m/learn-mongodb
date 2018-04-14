var mongo = require("mongodb").MongoClient
var dbName = process.argv[2]
var coll = process.argv[3]
var id = process.argv[4]
var url = "mongodb://localhost:27017/" + dbName

mongo.connect(url, function(err, db) {
    if (err)
        throw err
    var collection = db.collection(coll)
    collection.remove({
        _id: id
    }, function(err) {
        if (err)
            throw err
        db.close()
    })
})