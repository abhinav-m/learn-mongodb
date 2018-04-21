# Indexing in MongoDB

To retrieve documents in a database on some specific search criteria, in a typical situation documents in the collection should be scanned to find the results on the basis of some criteria.

Indexing improves performance by providing faster lookup time for searches while searching for records through the database.

This also improves performance in case of update cases (where the record has to be looked up first and then updated.)

> MongoDB uses btrees in its (MMAPv1 storage engine) / b+trees (WiredTiger) storage engine.

To create indexes in MongoDB:

```js
db.collection.createIndex({ student_id: 1, class_id: 1 });
```

## Concerns for indexes

An index on fields `a,b,c` will perform searches based on the leftmost terms of the index.

For example in the above case

* Searches on **(`a`),(`a,b`),(`a,b,c`)** will be fast due to smaller lookup time.

* Searches on **(`c`) , (`c,b`)** will be scanned.

* Searches on **(`a,c`)** will be scanned on the basis of the leftmost index **(`a`)** first then all records of **`c`** will be scanned to get the required value.

> **Index creation is expensive. It uses up space on the disk and data structures need to be modified for the entire collection.A general approach behind creating indexes is inserting data into the database and then creating index on the basis of access patterns on fields**
