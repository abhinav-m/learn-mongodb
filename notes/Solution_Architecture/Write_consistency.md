# Write consistency

In a replicated MongoDB set of nodes, theres a single primary which (by default) handles the writes and reads.

The reads to the data can go to the secondaries as well,but when the reads go to the primary, strong consistency is achieved with respect to reads and writes.This means that after a successful write, data that was written can be read from the database.

If reads go to the secondaries, stale data might be read.(Lag between two nodes is not guaranteed because Replication is Asynchronous.)
(Sometimes , Reading across secondaries is a good option to achieve scaling reads.)
