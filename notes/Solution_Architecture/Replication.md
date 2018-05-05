# Replication

Replication refers to repeating MongoDB servers / nodes in a primary-secondary configuration to achieve greater fault tolerance and availability.

Data amongst MongoDB nodes is replicated across multiple nodes to achieve this.

> Note: Replication process is asynchronous, Data that is written to primary is replicated to the secondaries in an asynchronous manner and not synchronously.

## Introduction

Example of a sample configuration:

Application(NodeMongo) <-> Mongo_Node_1 (Primary) -> Mongo_Node_2 (Secondary) -> Mongo_Node_3 (Secondary)

**Points to consider**:

* All data on primary Mongo server is replicated on the secondary nodes.
* In case of a node failure, the secondary nodes elect and decide a new primary node to communicate with the application.
* After the node failure has been resolved, the initial **primary** node will now act as a secondary node.
* The minimum number of mongo server instances for this configuraton is 3.

## Types of Replication Nodes

1.  Regular Node : This node can become the primary or the secondary.
2.  Arbiter Node: This is just there for voting purposes (in case of node failure and election).This ensures that in case of node failure, a strict majority is available for election.
3.  Delayed Node: This can be understood as a disaster recovery node, which has persisted data an hour or two behind the other nodes. This can participate in the voting, but cannot become a primary node. To achieve this, it's priority is set to zero.
4.  Hidden Node: Often used for analytics, it's priority is set to 0, so it cannot become a primary node.It can participate in elections.

These nodes can be assigned allowed number of votes for each server to increase/decrease their voting importance.

## Achieving write consistency

In a replicated MongoDB set of nodes, theres a single primary which (by default) handles the writes and reads.

The reads to the data can go to the secondaries as well,but when the reads go to the primary, strong consistency is achieved with respect to reads and writes.This means that after a successful write, data that was written can be read from the database.

If reads go to the secondaries, stale data might be read.(Lag between two nodes is not guaranteed because Replication is Asynchronous.)
(Sometimes , Reading across secondaries is a good option to achieve scaling reads.)

When a failure occurs and a primary node goes down, Writes cannot occur on a mongodb server instance (until the primary comes back online).This ensures that the writes on a server will be Consistent when they are successfull.

MongoDB doesn't guarantee `eventual consistency`.

> Eventual consistency is a consistency model used in distributed computing to achieve high availability that informally guarantees that, if no new updates are made to a given data item, eventually all accesses to that item will return the last updated value. Eventual consistency, also called optimistic replication,is widely deployed in distributed systems, and has origins in early mobile computing projects. A system that has achieved eventual consistency is often said to have converged, or achieved replica convergence. Eventual consistency is a weak guarantee – most stronger models, like linearizability are trivially eventually consistent, but a system that is merely eventually consistent does not usually fulfill these stronger constraints.
