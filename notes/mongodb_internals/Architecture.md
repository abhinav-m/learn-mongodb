# MongoDB internal architecture

## Basic architecture

> Node.js MongoDB native / PyMongo / other drivers -> MongoDB Server -> WiredTiger -> Ram/Disk

Using the Node.js / other drivers available for mongodb, software interacts with MongoDB database , which DEFERS the actual storage and persistence of data to a storage engine.

## Storage Engines

The default storage engine for MongoDB is `WiredTiger`.

The storage engine decides how to store data effectively (in memory) / persist across database.

The storage engine directly determines:

* The data file format (how data is written to disk)
* Format of indexes (format of indexes of data)

### MMapV1

> MMAP is a system call which allocates files/ devices into virtual memory.

MMAPv1 storage engine is a storage engine which is based off the MMAP system call.

It's main features are:

* Collection level locking (Pages in virtual memory that are being updating and belong to a collection will be locked for atomicity purposes).Only one write can happen to a SINGLE collection. (Multiple collection updates can happen simultaneously.)

* In place updates (documents are not moved to update them, they are updated in the page they reside in)

* To enable in place updates `Power of two sizes principle is used` ie, for 3 sized document -> 4 is allocated, 7 -> 8 , 19 -> 32 etc.This is useful for updates that increase the size of the document later

> Since the operating system's MMAP call is used, the database doesn't get to decide how the memory is actually mapped in terms of algorithm (from disk to virtual memory) ,sizing etc.

### WiredTiger

> Default storage engine used in MongoDB v >= 3.0

Wired tiger manages it's own memory storage of documents.

Pages stored in memory can be of varying sizes.

WiredTiger decides which pages it wants to keep in memory / move to disk.

For storage on disk, it can perform compression on indexes and data to achieve lesser storage space requirements.(Memory storage is always uncompressed)

It's main features are:

* Document level concurrency (unlike MMAP which is collection level)
* Compression of data and indexes.
* No inplace updates , append only. This allows _WiredTiger_ to run without locks at the document level, achieving document level concurrency.

> WiredTiger is an append only update engine, meaning that old documents needed to be updated are marked and moved to a new memory location and updations occur there.
> Eventually space is reclaimed that is no longer used and was marked previously.This allows WiredTiger to run without locks and achieve document level concurrency.(Might result in more writes, but is overall more efficient)

To check the storage engine being used for a collection `foo`:

> `db.foo.stats()`
