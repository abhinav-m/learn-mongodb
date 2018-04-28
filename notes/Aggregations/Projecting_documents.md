# Changing shape of project operations

Using the project operator on nested fields(arrays, objects etc) , we can shape our projected output as we need , while ALSO applying expressions on the fields in our document

## Promoting fields to upper level fields

We can shape our projected output to upper level fields(this can be thought of as promoting nested fields).

Using the `$` operator for nested fields, we can extract the values required for our projection (based on nesting)

Example,

```js
db.companies
  .aggregate([
    {
      //Match on funding_rounds
      $match: {
        'funding_rounds.investments.financial_org.permalink': 'greylock'
      }
    },
    //Project out the nested fields as top level fields
    {
      $project: {
        _id: 0,
        name: 1,
        ipo: '$ipo.pub_year', // taking the value for pub_year from the ipo field using the $ operator
        valuation: '$ipo.valuation_amount',
        // taking the value for permalink from the funding_rounds field (multi level nesting) using the $ operator
        funders: '$funding_rounds.investments.financial_org.permalink'
      }
    }
  ])
  .pretty();
```

The example output for the same is:

```json
//Note the queries on fields which dont have values in them will return as empty.
{
  "name": "LinkedIn",
  "ipo": 2011,
  "valuation": NumberLong("9310000000"),
  "funders": [
    ["sequoia-capital"],
    ["greylock"],
    ["bessemer-venture-partners", "european-founders-fund"],
    [
      "bain-capital-ventures",
      "sequoia-capital",
      "greylock",
      "bessemer-venture-partners"
    ],
    ["bessemer-venture-partners", "sap-ventures", "goldman-sachs"],
    [],
    [],
    []
  ]
}
```

## Embedding values within a document field

We can create a field consisting of nested document fields within mongodb using the `$` operator.

Example:

```js
db.companies
  .aggregate([
    {
      $match: {
        'funding_rounds.investments.financial_org.permalink': 'greylock'
      }
    },
    {
      $project: {
        _id: 0,
        name: 1,
        //Creating a founded field based on three fields founded_year, founded_month and founded_day
        founded: {
          year: '$founded_year',
          month: '$founded_month',
          day: '$founded_day'
        }
      }
    }
  ])
  .pretty();
```

```json
//Output
{
  "name": "WEbook",
  //Embedded fied consisting of the embedded fields above.
  "founded": {
    "year": 2007,
    "month": 1,
    "day": 1
  }
}
```

There are many operations possible on projection stage in the aggregation framework pipeline.(concatenating strings, taking averages of fields,etc) The only thing which is not possible is to CHANGE the data type of a document field during the projection stage.
