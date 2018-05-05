# Replication

Replication refers to repeating MongoDB servers / nodes in a primary-secondary configuration to achieve greater fault tolerance and availability.

Example of a sample configuration:

Application(NodeMongo) <-> Mongo_Node_1 (Primary) -> Mongo_Node_2 (Secondary) -> Mongo_Node_3 (Secondary)

**Points to consider**:

* All data on primary Mongo server is replicated on the secondary nodes.
* In case of a node failure, the secondary nodes elect and decide a new primary node to communicate with the application.
* After the node failure has been resolved, the initial **primary** node will now act as a secondary node.
* The minimum number of mongo server instances for this configuraton is 3.
