# Aggregation framework

MongoDB's aggregation framework works in a set of stages with a collection. The stages are responsible for some sort of aggregations/tasks on the collection (which can be the same for multiple stages or different) from which the output is produced.

This follows the same principles as pipelines in `bash`.

General way the aggregation framework works:
MongoDB collection -> stage_1 -> stage_2 -> stage_3 -> output

> A pipe is designated in commands by the vertical bar character, which is located on the same key as the backslash on U.S. keyboards. The general syntax for pipes is:

```bash
command_1 | command_2 [| command_3 . . . ]
```

This chain can continue for any number of commands or programs.

## Operations of aggregation

### Familiar operations:

* match (FIND)
* project
* sort
* skip
* limit

A sample query on the aggregation pipeline looks like the following:

```js
db.companies.aggregate([
  { $match: { founded_year: 2004 } }, //Match stage -> Matches founded year
  { $limit: 5 }, //Limits output to 5 documents
  { $project: { _id: 0, name: 1 } } //Projects name to our result output
]);
```

**NOTE**: It is important to consider the order of the stages when using aggregations, for example the above query can be rewritten as the following

```js
db.companies.aggregate([
  { $match: { founded_year: 2004 } }, //Match stage -> Matches founded year
  { $project: { _id: 0, name: 1 } }, //Projects name to our result output
  { $limit: 5 } //Limits output to 5 documents
]);
```

This is less efficient than the previous one , as it matches the founded year first, projects out the required fields (on all the documents found) and THEN limits the output to 5 documents.

Both of these queries produce the same output:

```js
//Output
{ "name" : "Digg" }
{ "name" : "Facebook" }
{ "name" : "AddThis" }
{ "name" : "Veoh" }
{ "name" : "Pando Networks" }
```

Another example of the same:

```js
//Sorts BEFORE limit stage , inefficient
db.companies.aggregate([
  { $match: { founded_year: 2004 } }, //Match stage -> Matches founded year
  { $sort: { name: 1 } }, // Sort stage -> Sort documents found
  { $limit: 5 }, //Limits output to 5 documents
  { $project: { _id: 0, name: 1 } } //Projects name to our result output
]);
//Sorts AFTER limit stage , inefficient
db.companies.aggregate([
  { $match: { founded_year: 2004 } }, //Match stage -> Matches founded year
  { $limit: 5 }, //Limits output to 5 documents
  { $sort: { name: 1 } }, //Sorts After limiting the documents
  { $project: { _id: 0, name: 1 } } //Projects name to our result output
]);
```

> Make SURE to pass only documents that are necessary from one stage to another while using the aggregation pipeline.

### Expressions

From the MongoDB documentation:

Some pipeline stages take a pipeline expression as the operand. Pipeline expressions specify the transformation to apply to the input documents. Expressions have a document structure and can contain other expression.

Pipeline expressions can only operate on the current document in the pipeline and cannot refer to data from other documents: expression operations provide in-memory transformation of documents.

Generally, expressions are stateless and are only evaluated when seen by the aggregation process with one exception: accumulator expressions.

The accumulators, used in the $group stage, maintain their state (e.g. totals, maximums, minimums, and related data) as documents progress through the pipeline.

Changed in version 3.2: Some accumulators are available in the $project stage; however, when used in the $project stage, the accumulators do not maintain their state across documents.
