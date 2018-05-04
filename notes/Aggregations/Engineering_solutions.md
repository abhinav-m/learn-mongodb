# Introduction

The general architecture of a MongoDB server is as follows

App -> PyMongo / NodeMongo -> Server -> Virtual Memory (RAM) -> Pages / Journal -> DISK

When an application communicates with the MongoDB server, the data is persisted in the virtual memory on the server (in pages) , written out to journal periodically, from where it gets transferred to the disk.

> By default `w=1` (write) and `j=false`(journal) is returned by the mongodb server.

This means, the data has been persisted into the pages in memory, but hasn't been written in the journal yet, or been persisted to disk.

**The `w` value and the `j` value together are known as the write concern.**
