var mongo = require("mongodb").MongoClient
var url = "mongodb://localhost:27017/learnyoumongo"
var size = process.argv[2]

mongo.connect(url, function(err, db) {
    var collection = db.collection("prices")
    collection.aggregate([
        { $match: { size: size } },
        {
            $group: {
                _id: 'average',
                average: {
                    $avg: '$price'
                }
            }
        }
    ]).toArray(function(err, results) {
        if (err)
            throw err
        console.log(Number(results[0].average).toFixed(2))
        db.close()
    })
})