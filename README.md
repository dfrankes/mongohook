# A lightweight MongoDB Hook module for node
## Tested with the following
mongodb https://www.npmjs.com/package/mongodb/v/3.6.6
Meteor 1.10.1 or above

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