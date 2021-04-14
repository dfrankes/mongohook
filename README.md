# A lightweight MongoDB Hook module for node

### Usage

Import mongodb and mongohook package
```js
const mongohook = require('@dfrankes/mongohook');
const mongodb = require('mongodb');
```

Before you make a database connection, run the following function
```js
mongohook.hook(mongodb, {options});
```

Create a beforeHook for the collection mycollection
```js
// Connect to mongodb
// client = mongodb.MongoClient('mongodb://')
client.collection('mycollection').before('insertMany', (query) => {
    return {createdAt: new Date()};
});
```
___

# Hook options
| option        | return        | info  |
| ------------- |:-------------:| -----:|
| idStrategy    | Function that returns a random string | this is used to set the _id field |



# Available hooks
| hook        |
| -----------:|
| insert      |
| insertMany  |
| updateOne   |
| updateMany  |
| replaceOne  |
| insertOne   |