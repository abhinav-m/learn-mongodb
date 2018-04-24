# Performance and profiling

MongoDB automatically logs queries which take more than 100ms to execute.

## Profiler

Writes entries / documents to `system.profile` on basis of query execution time specified.

It has 3 possible profile values:

1.  Level 0 (default, off)
2.  Level 1 (slow queries logged)
3.  Level 2 (all queries logged)

> **Level 2** is more of a general debugging feature than a performance debugging feature.

To run mongodb with specified profile value

> `mongod --dbpath ... --profile 1 --slowms 2`

To set profiling level in mongo shell:

> db.setProfilingLevel(1,4) //Profile level 1 , queries logged above 4 milliseconds

To see system profile execution data

> db.system.profile.find().pretty()
