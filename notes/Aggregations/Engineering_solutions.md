# Introduction

The general architecture of a MongoDB server is as follows

App -> PyMongo / NodeMongo -> Server -> Virtual Memory (RAM) -> Pages / Journal -> DISK

When an application communicates with the MongoDB server, the data is persisted in the virtual memory on the server (in pages) , written out to journal periodically, from where it gets transferred to the disk.

> By default `w=1` (write acknowledgement) and `j=false`(journal) is returned by the mongodb server.

This means, the data has been persisted into the pages in memory, but hasn't been written in the journal yet, or been persisted to disk.

**The `w` value and the `j` value together are known as the write concern.**

## Options to be considered:

```json
//Fast, small window of vulnerability when data has not been persisted to disk and if server crashes.
This is the default value.
{ "w": 1, "j": false }


//Slower, window of vulnerability removed. Writes are written to journal, in case of crash can be re persisted to pages, thus giving greater level of safety.
{ "w": 1, "j": true }

//Not recommended, no write acknowledgement sent by server.
{ "w":0,"j":"unack"}
```
