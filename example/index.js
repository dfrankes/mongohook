const MongoHook = require('../src/index');
const mongodb = new MongoHook(require('mongodb'), {});


(async function(){
    let mongo = new Promise(function(resolve, reject){
    	mongodb.MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true}, function(error, client){
        if(!error && client.db){
    			resolve(client.db('test'));
    		}else {
    			reject(error);
            }
    	});
    });
    mongo.then(async client => {
        client.collection('test').before('insertOne', (args) => {
            args['0'].created_at = new Date(); // Inject created_at date
            return args;
        });
        let updateOne = await client.collection('test').insertOne({hello: 'world'});
    })
})();