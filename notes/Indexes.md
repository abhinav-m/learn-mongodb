# Indexing in MongoDB

To retrieve documents in a database on some specific search criteria, in a typical situation documents in the collection should be scanned to find the results on the basis of some criteria.

Indexing improves performance by providing faster lookup time for searches while searching for records through the database.

This also improves performance in case of update cases (where the record has to be looked up first and then updated.)

> MongoDB uses btrees in its (MMAPv1 storage engine) / b+trees (WiredTiger) storage engine.

* To create indexes in MongoDB:

```js
db.collection.createIndex({ student_id: 1, class_id: 1 });
```

* To List indexes in MongoDB:

```js
db.collection.getIndexes();
//Output
[
  //One index on this collection , by default on _id
  {
    v: 2,
    key: {
      _id: 1
    },
    name: '_id_',
    ns: 'crunchbase.companies'
  }
];
```

* To Drop Indexes in MongoDB:

```js
db.collection.dropIndex({ student_id: 1 });
```

## Multikey indexes

For indexes specified on array fields in documents, MultiKey indexes are created for the specified documents.

The index would automatically be created as multikey on the first value inserted as an array for the specified keys.

This is done on insertion of the documents with array values (on the fields specified as the index).

```js
db.foo.createIndex({tags:1,favcolr:1})
//First insert
{
    name:"Abhinav",
    tags:["Reading","music","badminton"],
    favcolr:"red",
    location:["NOIDA","DELHI"]
}
//Second Insert:
{
    name:"Abhinav",
    tags:"reading",
    favcolr:"[red","blue"],
    location:["NOIDA","DELHI"]
}
//Not allowed to have on two ARRAY fields. This insertion will fail.
{
    name:"Abhinav",
    tags:["Reading","music","badminton"],
    favcolr:"[red","blue"],
    location:["NOIDA","DELHI"]
}
```

> In the above document, if we need to create an index on the `tags` field and `favcolr` field, MongoDB will create a multi-key index for the same.

**NOTE: MongoDB does NOT allow creation of multikey indexes for two array fields. This would result in a cartesian product(cross join in relational terms) of the two fields.**

* To create indexes for objects embedded inside of arrays in a document, the command `db.collection.createIndex` can be used with the dot notation.

Example:

```js
db.students.createIndex({ 'scores.score': 1 });

//Students collection:
{
    name:"Abhinav",
    scores:[
        {
            score:"99",
            type:"Exam"
        },
        {
            score:"59",
            type:"Homework"
        },
        {
            score:"79",
            type:"Homework"
        },
        {
            score:"70",
            type:"practical"
        }
    ]
}
```

To write querries for the same, care must be taken to ensure using the correct operator , eg `$elemmatch:"abc"` In case of array fields on multiple conditions.

## Concerns for indexes

An index on fields `a,b,c` will perform searches based on the leftmost terms of the index.

For example in the above case

* Searches on **(`a`),(`a,b`),(`a,b,c`)** will be fast due to smaller lookup time.

* Searches on **(`c`) , (`c,b`)** will be scanned.

* Searches on **(`a,c`)** will be scanned on the basis of the leftmost index **(`a`)** first then all records of **`c`** will be scanned to get the required value.

> **Index creation is expensive. It uses up space on the disk and data structures need to be modified for the entire collection.A general approach behind creating indexes is inserting data into the database and then creating index on the basis of access patterns on fields**
