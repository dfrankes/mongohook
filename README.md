# A lightweight MongoDB Hook module for node
## Tested with the following packages
- mongodb https://www.npmjs.com/package/mongodb/v/3.6.6 

## Usage

Import mongodb and mongohook
```js
const MongoHook = require('@dfrankes/mongohook');

// Pass in the mongodb package require, this will return a hooked mongodb package
const mongodb   = new MongoHook(require('mongodb'), {});

```
You can now use the mongodb package as usual 
```js
mongodb.MongoClient.connect
```

Create a before hgook for the collection mycollection
```js
// Create a before hook for the collection insertOne
// args is the original function arguments
// for a updateOne it uses the following layout
// args['0'] = the find query
// args['1'] = the update query ($set:{hello: true});
// just console.log the args to check what you can modify

// You can find a full example in example/index.js
client.collection('mycollection').before('insertOne', (args) => {
    // args is an array with all the original method arguments
    // You can for example modify a insertOne query like this
    // The query you execute will look like this db.mycollection.insertOne({hello: 'world})
    // Now you if you want to for example add a createdAt date you can do it like this 
    // since index 0 contains the object to insert 
    args['0'].createdAt = new Date();

    // return the original arguments
    // this will be executed in the original method
    return args;
});

// Create a afterHook
client.collection('mycollection').after('insertOne', async (result) => {
    console.log("after insertOne on mycollection");
});

```

# Supported hooks
| hook        |
| -----------:|
| insert      |
| insertOne   |
| insertMany  |
| replaceOne  |
| update      |
| updateOne   |
| updateMany  |