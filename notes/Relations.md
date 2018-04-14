## Relations in MongoDB

### One to one

**Case** `Employee <-> Resume`

> Storing resume id in employee documents.

```js
//Employee
{
    _id:"1",
    name:"abc",
    resume_id:"1"
}

//Resume
{
    _id:"1",
    jobs:[],
    education:[]
}
```

> Storing employee id in resume documents

```js
//Employee
{
    _id:"1",
    name:"abc",
    email:"abc@example.com"
}

//Resume
{
    _id:"1",
    jobs:[],
    education:[],
    employee_id:"1"
}
```

> Embedding resume document within employee document (or vice versa).

```js
//Employee with embedded resume.
{
    _id:"1",
    name:"abc",
    email:"abc@example.com"
    resume:{
    _id:"1",
    jobs:[],
    education:[],
    employee_id:"1"
}
}
```

**Considerations**:

1.  Frequent access: If resume is a big document, and you are considering getting employee documents frequently , embedding will cause a significant performance hit.
2.  Size of the items:Size of the documents would increase with embedding.
3.  Update considerations: Embedding will cause changes to the employees document whenever resume is changed, can lead to performance issues.
4.  Max size: 16megabytes is the maximum size allowed for documents, embedding can cause this to exceed.
5.  Atomicity: Embedding can ensure that both employee and his resume are updated at once as documents updation is atomic in MongoDB.

### One to many

**Case** `City <-> Person`

* If we store the city in a person collection, city documents will be duplicated:

```js
//person collection:
[
  //Duplication of embedded city collection here.
  {
    _id: '',
    name: 'abhinav',
    city: {
      name: 'noida',
      state: 'xyz'
    }
  },
  {
    _id: '',
    name: 'xyz',
    city: {
      name: 'noida',
      state: 'lmn'
    }
  },
  {
    _id: '',
    name: 'bcd',
    city: {
      name: 'city 2',
      state: 'xyz'
    }
  }
];
```

* Keeping two seperate collections:

> Works best for truly **one to many** relationships, must observe the data and ensure this is the case before deciding schema.

```js
//Must ensure integrity is maintained while inserting documents into people
//people
{
    name:"abhinav",
    city:"NOIDA",
}

//city
{
    _id:"NOIDA"
}
```

**Case** `One <-> few`

* Embedding can be done if its feasible to have a collection of the _One_ entity with the _few_ entity.

A simple example of this is Blog posts with comments,where each blog posts can have a few comments.

> Duplication here will not be an issue because the comments are embedded within a single post.

```js
//posts
[
  //Posts have embedded comments ensuring data integrity.
  {
    name: 'Post 1',
    comments: [
      {
        name: 'comment 1',
        content: 'comment content'
      },
      {
        name: 'comment 2',
        content: 'comment content 2'
      }
    ]
  },
  {
    name: 'Post 2',
    comments: [
      {
        name: 'comment 1',
        content: 'comment content'
      },
      {
        name: 'comment 2',
        content: 'comment content 2'
      }
    ]
  }
];
```

### Many to many

**Case** `Authors <-> Books`

This case would actually be **Few to few** as there can be a large number of authors, and books, but the relationships between them is **GENERALLY** going to be few to few.

```js
//Books
//Maintaining authors inside books collection.
//Easier to ensure integrity.
[
  {
    _id: 1,
    title: 'Peak performance',
    authors: [1, 2]
  },
  {
    _id: 2,
    title: 'Harry Potter',
    authors: [3]
  }
];

//Authors:
[
  {
    _id: 1,
    name: 'xyz'
  },
  {
    _id: 2,
    name: 'abc'
  },
  {
    _id: 3,
    name: 'JK rowling'
  }
];

//Books
//Maintaining authors inside books collection and vice versa.
//Harder to maintain integrity.
[
  {
    _id: 1,
    title: 'Peak performance',
    authors: [1, 2]
  },
  {
    _id: 2,
    title: 'Harry Potter',
    authors: [3]
  }
];

//Authors:
[
  {
    _id: 1,
    name: 'xyz',
    books:[1];
  },
  {
    _id: 2,
    name: 'abc',
    books:[1]
  },
  {
    _id: 3,
    name: 'JK rowling',
    books:[2]
  },

];
```

> We can also embed books inside authors collection, but this can cause data integrity issues.
