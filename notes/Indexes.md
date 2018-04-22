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

* To create an index in MongoDB with the unique key constraint:

````js
//This won't allow duplicate values on key thing in the collection
db.collection.createIndex({thing:1},{unique:true})

//Can be on multiple fields as well , both fields as well as their combinations won't allow duplicate inserts
db.collection.createIndex({thing:1,thing_2:1},{unique:true})

db.collection.insert({thing:"abc",thing_2:"xyz"})

//Won't allow again E11000 error
db.collection.insert({thing:"abc",thing_2:"xyz"})

//Allowed, not a combination of both (which was inserted earlier)
db.collection.insert({thing:"abc"})

//NOT Allowed, since the individual key will also enforce unique constraints.
db.collection.insert({thing:"abc"})


```

* To create a sparse index

> A sparse index allows unique key constraints on indexes which might be missing values in the database (are null)

To create a sparse index, command :` db.collection.createIndex({thing:1},{sparse:true})`

This can be useful for creating indexes on fields some of whose values might not be present in the document (whose values are null), allowing greater flexibility while creating indexes, and enforcing unique constraint.

```js
//This will allow null values to exist in 'thing' key without breaking the unique constraint.
db.collection.createIndex({thing:1},{sparse:true,unique:1})

```

## Creating indexes in Foreground vs Background

### Foreground:
* Relatively fast
* Blocks writes and reads in the **DATABASE** being created upon(others are still accessible)
* `db.createIndex({thing:1})`


### Background:
* Relatively slower
* Doesn't block reads /writes
* `db.createIndex({thing:1}),{background:true})`

**NOTE: Multiple background indexes can be created in parallel on the same database**

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
````

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

### Performance concerns

* **Index creation is expensive. It uses up space on the disk and data structures need to be modified for the entire collection.A general approach behind creating indexes is inserting data into the database and then creating index on the basis of access patterns on fields**

* Every index created on a collection should be used in some way while querying the data. This should be ensured, otherwise it would be a waste.

* Every Query being run on the data should use an index to return the data.

## Using Explain

### Query Planner mode

Explain command can be used to see how the query will produce the desired output which is intended of it.
Note: This doesn't actually return the output to the client, just shows how it will be generated in case it is queried upon

There are two ways to use the explain command:

1 `db.collection.find({a:1}).explain()` Here, we use the cursor object returned by find and append the explain() method on it to see how the query is run. This is an older method and doesn't work when we use aggregations eg count method on the query being rune.

2 Using Explain with an explainable object
This allows two main advantages: aggregations explanations and helper interface(how to use this object)

```js
let explainable = db.foo
  .explain(); //Create explainable object
  //The following commands can be chained on to the explainable object to show result of how the query is executed.
  explainable.find()
  explainable.update()
  explainable.remove()
  explainable.aggregate()
  //Special function to show which functions can be used with help
  explainable.help();

  //This won't work as the cursor isn't returned in case of remove() command
  db.foo.remove({a:1,b:2}).explain()

//Result is of the type:


{
	    "queryPlanner" : {
		"plannerVersion" : 1,
		"namespace" : "test.stuff",
		"indexFilterSet" : false,
		"parsedQuery" : {
			"thing" : {
				"$eq" : 1
			}
		},
        //Plan used to fetch the query
		"winningPlan" : {
			"stage" : "FETCH",
			"inputStage" : {
				"stage" : "IXSCAN",
				"keyPattern" : {
					"thing" : 1,
					"thing1" : 1
				},
                //Index used, and details
				"indexName" : "thing_1_thing1_1",
				"isMultiKey" : false,
				"multiKeyPaths" : {
					"thing" : [ ],
					"thing1" : [ ]
				},
				"isUnique" : true,
				"isSparse" : false,
				"isPartial" : false,
				"indexVersion" : 2,
				"direction" : "forward",
				"indexBounds" : {
					"thing" : [
						"[1.0, 1.0]"
					],
					"thing1" : [
						"[MinKey, MaxKey]"
					]
				}
			}
		},
        //Any rejected plans considered for the query, based on indexes.
		"rejectedPlans" : [ ]
	},
	"serverInfo" : {
		"host" : "abhinav-Lenovo-Z50-70",
		"port" : 27017,
		"version" : "3.6.3",
		"gitVersion" : "9586e557d54ef70f9ca4b43c26892cd55257e1a5"
	},
	"ok" : 1
}
```

### Execution stats mode

The execution stats mode adds additional output to the explain command, returning key stats for the query execution such as documents examined by the query, documents returned , time used to execute the query etc.

> NOTE: The verbosity levels for the explain command are incremental, for `executionStats` mode, the `queryPlanner` mode output will also be included in the explainable object / cursor explain command output.

```js
var foo = db.foo.explain('executionStats');

foo.find({ thing: '1' });

// Execution stats mode output

"executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 0,
		"executionTimeMillis" : 0,
		"totalKeysExamined" : 0,
		"totalDocsExamined" : 0,
		"executionStages" : {
			"stage" : "FETCH",
			"nReturned" : 0,
			"executionTimeMillisEstimate" : 0,
			"works" : 1,
			"advanced" : 0,
			"needTime" : 0,
			"needYield" : 0,
			"saveState" : 0,
			"restoreState" : 0,
			"isEOF" : 1,
			"invalidates" : 0,
			"docsExamined" : 0,
			"alreadyHasObj" : 0,
			"inputStage" : {
				"stage" : "IXSCAN",
				"nReturned" : 0,
				"executionTimeMillisEstimate" : 0,
				"works" : 1,
				"advanced" : 0,
				"needTime" : 0,
				"needYield" : 0,
				"saveState" : 0,
				"restoreState" : 0,
				"isEOF" : 1,
				"invalidates" : 0,
				"keyPattern" : {
					"thing" : 1,
					"thing1" : 1
				},
				"indexName" : "thing_1_thing1_1",
				"isMultiKey" : false,
				"multiKeyPaths" : {
					"thing" : [ ],
					"thing1" : [ ]
				},
				"isUnique" : true,
				"isSparse" : false,
				"isPartial" : false,
				"indexVersion" : 2,
				"direction" : "forward",
				"indexBounds" : {
					"thing" : [
						"[1.0, 1.0]"
					],
					"thing1" : [
						"[MinKey, MaxKey]"
					]
				},
				"keysExamined" : 0,
				"seeks" : 1,
				"dupsTested" : 0,
				"dupsDropped" : 0,
				"seenInvalidated" : 0
			}
		}
	}
```

### All plans execution

The query optimizer in MongoDB runs all the possible queries against the indexes available in the collection in parallel, and decides which one is the fastest as it runs. The `All plans execution` option for explain command shows all the execution plans which were used to decide the current query being run and why it was chosen amongst them.

```js
var foo = db.example.explain('allPlansExecution');

foo.find({ a: 1, b: 2 });
```

> Using the output of the `allPlansExecution` mode , we can see why the database chose to return output / how it is decided that the query being run will be the most optimized.

## Covered Queries

A covered query that is satisfied entirely with an index scan ( 0 documents need to be examined to satisfy the query).

```js
var exp = db.foo.explain('executionStats')

//Removing _id from the projected output to avoid unneeded index scans on the id.
exp.find({thing:1},{_id:0,thing:1)

//A covered query sample output, note the documents examined are 0 , whereas the keys examined are 10.
//Thus the query is said to be 'covered' by the index placed on it.
"executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 10,
		"executionTimeMillis" : 0,
		"totalKeysExamined" : 10,
		"totalDocsExamined" : 0,
		"executionStages" : {

//NOTE: A query which only surpresses _id and DOESNT project "thing" (on which we created our index)
//will STILL be scanned amongst all documents for a match. This is because mongodb doesn't know for
//sure that other indexed keys are available on the documents or not.
exp.find({thing:1},{_id:0}) // Documents will still be scanned in this case.
"executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 10,
		"executionTimeMillis" : 0,
		"totalKeysExamined" : 10,
		"totalDocsExamined" : 10,
		"executionStages" : {
```

> NOTE: It is IMPORTANT to project out specific keys on which the data is indexed upon for unneeded document examinations in a COVERED query.

> NOTE: Remember that indexes use the left most subset of the index to find results.

```js
//For a collection with the indexes:
{ name : 1, dob : 1 }
{ _id : 1 }
{ hair : 1, name : 1 }

//Queries:
//NOT a covered query, as result returns name, which is NOT leftmost part of the index above({hair:1,name:1}) even
//though _id is surpressed
db.example.find({name:{$in:["Bart","Homer"]}},{_id:0,hair:1,name:1})


//Covered query using the first index({ name : 1, dob : 1 }) which satisfies it being the only values returned, _id being surpressed and name is leftmost subset in the index.
db.example.find({name:{$in:["Bart","Homer"]}},{_id:0,dob:1,name:1})
```
