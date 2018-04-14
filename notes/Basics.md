## Third Normal Form:

### What?

> Every non key attribute in a table must provide some facts on the key, the whole key and nothing but the key.

### Why?

1.  Frees the database of modification anomalies.
2.  Minimize redesign when extending database.
3.  **Avoid any bias towards a particular access pattern**

> Modification anomalies are avoided in MongoDB, might not be the case for some applications.

> Minimal redesign is needed for MongoDB databases ( multiple keys and attributes can be inserted easily in documents)

> MongoDB avoids the third point listed above in its schema design( data is structured in a manner that the access pattern isn't important.)

## Living without constraints:

In SQL you add foreign key constraints to ensure values stored in your database are correct, when they are related to one another.

In MongoDB, you prejoin the data and embed data in your documents , to ensure that a document contains the data you need.

## Living without transactions:

SQL databases allow **TRANSACTIONS** by following the **ACID** properties.

> ACID -> Atomicity
> Consistency
> Isolation
> Durability

**Atomicity** means that you can guarantee that all of a transaction happens, or none of it does; you can do complex operations as one single unit, all or nothing, and a crash, power failure, error, or anything else won't allow you to be in a state in which only some of the related changes have happened.

**Consistency**: means that you guarantee that your data will be consistent; none of the constraints you have on related data will ever be violated.

**Isolation**: means that one transaction cannot read data from another transaction that is not yet completed. If two transactions are executing concurrently, each one will see the world as if they were executing sequentially, and if one needs to read data that is written by another, it will have to wait until the other is finished.

**Durability**: means that once a transaction is complete, it is guaranteed that all of the changes have been recorded to a durable medium (such as a hard disk), and the fact that the transaction has been completed is likewise recorded.

> So, transactions are a mechanism for guaranteeing these properties; they are a way of grouping related actions together such that as a whole, a group of operations can be atomic, produce consistent results, be isolated from other operations, and be durably recorded.

### How to do this in MongoDB?

1.  Restructure code to work on a single document at a time( changes to documents **are atomic** in MongoDB)

2.  Implement locking in MongoDB to achieve isolation(semaphores etc)

3.  In a lot of web applications, database consistency is not needed (a post can be shown to multiple users a few seconds after each other) Tolerance is accepted in SOME cases while designing systems.

## Blog schema in mongodb example:

#### Posts

```js
{
_id:"",
title:"Blog title",
author:"Blog author",
content:"Blog content",
comments:[{author:"comment author",content:"comment content"}]
}
```

#### Author

```js
{
    _id:"",
    author_name:"",
    author_emails:""
}
```
