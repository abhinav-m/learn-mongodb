### Representing trees.

Considering a simple schema involving products and categories:

Home -> Outdors -> Winter -> Snow

> This is how you would represent a tree in mongodb.The categories class has an array containing all of the nodes
> which are it's ancestors.

```js
//products
{
    category:7,
    product_name:"Leaf blower"
}

//categories
{
    _id:7,
    category_name:"outdoors",
    //Ancestors to this particular category.
    ancestors:[1,2,3,4,5]
}
```
