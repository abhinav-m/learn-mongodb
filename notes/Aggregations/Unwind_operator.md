# Unwind operator

The `$unwind` operator is used for documents which contain array fields within them to create a single document from all the results for the field which is an array.

Example , In the crunchbase dataset we have a fields called `funding_rounds` with it's format as below:

```json
{
    ...,
    ...,
    ...,
  "funding_rounds": [
    {
      "id": 62,
      "round_code": "a",
      "source_url":
        "http://venturebeat.com/2006/09/25/digg-founders-launch-revision3-a-new-video-studio/",
      "source_description": "",
      "raised_amount": 1000000,
      "raised_currency_code": "USD",
      "funded_year": 2006,
      "funded_month": 9,
      "funded_day": 1,
      "investments": [
        {
          "company": null,
          "financial_org": {
            "name": "Greylock Partners",
            "permalink": "greylock"
          },
          "person": null
        },
        {
          "company": null,
          "financial_org": {
            "name": "SV Angel",
            "permalink": "sv-angel"
          },
          "person": null
        }
      ]
    },
    {
      "id": 63,
      "round_code": "b",
      "source_url":
        "http://goliath.ecnext.com/coms2/gi_0199-6665756/Revision3-Closes-8-Million-Series.html",
      "source_description": "",
      "raised_amount": 8000000,
      "raised_currency_code": "USD",
      "funded_year": 2007,
      "funded_month": 6,
      "funded_day": 1,
      "investments": [
        {
          "company": null,
          "financial_org": {
            "name": "Greylock Partners",
            "permalink": "greylock"
          },
          "person": null
        }
      ]
    }
  ]
}
```

If we run a query on this document format and match financial_org.permalink(which itself is an array) as follows:

```js
db.companies.aggregate([
  {
    $match: { 'funding_rounds.investments.financial_org.permalink': 'greylock' }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      amount: '$funding_rounds.raised_amount',
      year: '$funding_rounds.funded_year'
    }
  }
]);
```

This will produce an output where amount and year are themselves arrays(with length equal to the length of `funding_rounds`)

```json
//amount and year fields are arrays.
{ "name" : "Digg", "amount" : [ 8500000, 2800000, 28700000, 5000000 ], "year" : [ 2006, 2005, 2008, 2011 ] }
{ "name" : "Facebook", "amount" : [ 500000, 12700000, 27500000, 240000000, 60000000, 15000000, 100000000, 60000000, 200000000, 210000000, 1500000000 ], "year" : [ 2004, 2005, 2006, 2007, 2007, 2008, 2008, 2008, 2009, 2010, 2011 ] }
{ "name" : "Revision3", "amount" : [ 1000000, 8000000 ], "year" : [ 2006, 2007 ] }


...
...
```

If we unwind the array field "funding_rounds" using the following query:

```js
db.companies.aggregate([
  {
    $match: { 'funding_rounds.investments.financial_org.permalink': 'greylock' }
  },
  { $unwind: '$funding_rounds' },
  {
    $project: {
      _id: 0,
      name: 1,
      amount: '$funding_rounds.raised_amount',
      year: '$funding_rounds.funded_year'
    }
  }
]);
```

The output json will be the of the following type:

```json
{ "name" : "Digg", "amount" : 8500000, "year" : 2006 }
{ "name" : "Digg", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "amount" : 28700000, "year" : 2008 }
{ "name" : "Digg", "amount" : 5000000, "year" : 2011 }
{ "name" : "Facebook", "amount" : 500000, "year" : 2004 }
{ "name" : "Facebook", "amount" : 12700000, "year" : 2005 }
{ "name" : "Facebook", "amount" : 27500000, "year" : 2006 }
{ "name" : "Facebook", "amount" : 240000000, "year" : 2007 }
{ "name" : "Facebook", "amount" : 60000000, "year" : 2007 }
{ "name" : "Facebook", "amount" : 15000000, "year" : 2008 }
{ "name" : "Facebook", "amount" : 100000000, "year" : 2008 }
{ "name" : "Facebook", "amount" : 60000000, "year" : 2008 }
{ "name" : "Facebook", "amount" : 200000000, "year" : 2009 }
{ "name" : "Facebook", "amount" : 210000000, "year" : 2010 }
{ "name" : "Facebook", "amount" : 1500000000, "year" : 2011 }
{ "name" : "Revision3", "amount" : 1000000, "year" : 2006 }
{ "name" : "Revision3", "amount" : 8000000, "year" : 2007 }
```

Consider the following case, where the `investments` field inside `funding_rounds` is itself an array, and we are searching for the value **"greylock"** inside this field.

```js
db.companies.aggregate([
  {
    $match: { 'funding_rounds.investments.financial_org.permalink': 'greylock' }
  },
  { $unwind: '$funding_rounds' },
  {
    $project: {
      _id: 0,
      name: 1,
      funder: '$funding_rounds.investments.financial_org.permalink',
      amount: '$funding_rounds.raised_amount',
      year: '$funding_rounds.funded_year'
    }
  }
]);
```

Since the funding_rounds fields is itself an array, this will result in all the output being shown wherever we have one '$funding_rounds.investments.financial_org.permalink' value as "greylock" , also the funder field will ITSELF be an array (and not be unwound)

Example output:

```json
//Since the array field contains a value of "greylock" in it's other fields, the first result even though it
//doesnt contain "greylock" is shown
{ "name" : "Farecast", "funder" : [ "madrona-venture-group", "wrf-capital" ], "amount" : 1500000, "year" : 2004 }
{ "name" : "Farecast", "funder" : [ "greylock", "madrona-venture-group", "wrf-capital" ], "amount" : 7000000, "year" : 2005 }
{ "name" : "Farecast", "funder" : [ "greylock", "madrona-venture-group", "par-capital-management", "pinnacle-ventures", "sutter-hill-ventures", "wrf-capital" ], "amount" : 12100000, "year" : 2007 }
```

Adding a second unwind stage to the output (on the array field `investments` after matching) we can get the result in the form of individual documents:

```js
db.companies.aggregate([
  {
    $match: { 'funding_rounds.investments.financial_org.permalink': 'greylock' }
  },
  { $unwind: '$funding_rounds' },
  //2nd unwind stage.
  { $unwind: '$funding_rounds.investments' },
  {
    $project: {
      _id: 0,
      name: 1,
      funder: '$funding_rounds.investments.financial_org.permalink',
      amount: '$funding_rounds.raised_amount',
      year: '$funding_rounds.funded_year'
    }
  }
]);
```

```json
//Now individual documents with funder fields (projected above note, we match if funding rounds has AT LEAST ONE round with "greylock" as the funding organisation. )
{ "name" : "Farecast", "funder" : "madrona-venture-group", "amount" : 1500000, "year" : 2004 }
{ "name" : "Farecast", "funder" : "wrf-capital", "amount" : 1500000, "year" : 2004 }
{ "name" : "Farecast", "funder" : "greylock", "amount" : 7000000, "year" : 2005 }
```

Going a step further , if we wwant to distnguish between individual funders and organizations, we can run the following query:

```js
db.companies.aggregate([
  {
    $match: { 'funding_rounds.investments.financial_org.permalink': 'greylock' }
  },
  { $unwind: '$funding_rounds' },
  { $unwind: '$funding_rounds.investments' },
  {
    $project: {
      _id: 0,
      name: 1,
      individualFunder: '$funding_rounds.investments.person.permalink',
      fundingOrganization:
        '$funding_rounds.investments.financial_org.permalink',
      amount: '$funding_rounds.raised_amount',
      year: '$funding_rounds.funded_year'
    }
  }
]);
```

Output is as follows, note that `individualFunders` are unwinded and result in their own documents,where applicable:

```json
{ "name" : "Digg", "fundingOrganization" : "greylock", "amount" : 8500000, "year" : 2006 }
{ "name" : "Digg", "fundingOrganization" : "omidyar-network", "amount" : 8500000, "year" : 2006 }
{ "name" : "Digg", "fundingOrganization" : "greylock", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "fundingOrganization" : "omidyar-network", "amount" : 2800000, "year" : 2005 }
//Individual funders in output where applicable.
{ "name" : "Digg", "individualFunder" : "marc-andreessen", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "individualFunder" : "reid-hoffman", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "individualFunder" : "ron-conway", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "individualFunder" : "al-avery", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "fundingOrganization" : "floodgate", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "fundingOrganization" : "sv-angel", "amount" : 2800000, "year" : 2005 }
{ "name" : "Digg", "fundingOrganization" : "highland-capital-partners", "amount" : 28700000, "year" : 2008 }
{ "name" : "Digg", "fundingOrganization" : "greylock", "amount" : 28700000, "year" : 2008 }
{ "name" : "Digg", "fundingOrganization" : "omidyar-network", "amount" : 28700000, "year" : 2008 }
{ "name" : "Digg", "fundingOrganization" : "svb-financial-group", "amount" : 28700000, "year" : 2008 }
```
