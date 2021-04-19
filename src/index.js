class MongoHook {
    hooks = ['insert', 'insertOne', 'updateOne', 'replaceOne', 'update', 'insertMany', 'updateMany'];
    hookStorage = {
        before: {},
        after: {}
    };

    constructor(driver, options = {}) {
        // Return hooked driver
        return this._hookMongo(driver, options);
    }

    _hookMongo = (driver, options) => {

        // Validate if the user provided a valid Mongo npm package
        if(typeof driver.MongoClient !== "function") throw new Error('You must provide a valid mongodb driver https://www.npmjs.com/package/mongodb include')

        // Create our driver prototype
        driver.Collection.prototype.MongoHook = this;

        // Create before hook
        driver.Collection.prototype.before = function(method, callback){
            const nameSpace = this.namespace;

            // Create namespace container
            if(!this.MongoHook.hookStorage.before[nameSpace]) this.MongoHook.hookStorage.before[nameSpace] = {};

            // Register hook for given namespace
            this.MongoHook.hookStorage.before[nameSpace][method] = callback;
        }


        // Create after hook
        driver.Collection.prototype.after = function(method, callback){
            const nameSpace = this.namespace;

            // Create namespace container
            if(!this.MongoHook.hookStorage.after[nameSpace]) this.MongoHook.hookStorage.after[nameSpace] = {};

            // Register hook for given namespace
            this.MongoHook.hookStorage.after[nameSpace][method] = callback;
        }

        // Register function hooks
        this.hooks.forEach(hook => {
            let _super = driver.Collection.prototype[hook];
            if (typeof _super === "function") {

                driver.Collection.prototype[hook] = async function () {
                    let args = arguments;
                    const nameSpace = this.namespace;
                    if(this.MongoHook && this.MongoHook.hookStorage && this.MongoHook.hookStorage.before[nameSpace] && this.MongoHook.hookStorage.before[nameSpace][hook]){

                        // Execute callback with args
                        // User should modify the args and return them, we will set them back as the original args if validated
                        // This is to make sure the user will be able to modify anything
                        // and there wont be a need for me to write method specific code ^^
                        const callback = this.MongoHook.hookStorage.before[nameSpace][hook](args);
                        if(callback && typeof args === typeof callback){
                            args = callback;
                        }

                        const _call = _super.apply(this, args);

                        // Check if we need to run a after hook
                        if(this.MongoHook.hookStorage.after[nameSpace] && this.MongoHook.hookStorage.after[nameSpace][hook]){
                            this.MongoHook.hookStorage.after[nameSpace][hook](_call);
                        }
                        return _call;
                    }
                    return _super.apply(this, args);
                }
            }else{
                throw new Error(`unable to hook mongodb package @ driver.Collection.prototype.${hook}`)
            }
        })

        // return the driver back to the user
        return driver;
    }
}

module.exports = MongoHook;