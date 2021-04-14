module.exports = {
    hook: (mongodb, options) => {

        // Setup our hook methods in the mongodb Collection class
        const hooks = ['insert', 'insertMany', 'updateOne', 'updateMany', 'replaceOne', 'insertOne'];

        // Register mongohook callbacks into the prototype
        mongodb.Collection.prototype.before = function(hook, callback){
            if(!hooks.includes(hook)) throw new Error(`Unknown hook ${hook}`);
            if(!this.s.pkFactory.hooks_before){
                this.s.pkFactory.hooks_before = {};
            }
            this.s.pkFactory.hooks_before[hook] = callback;
        }

        validateHookResult = (hook, instance, query) => {
            if(!instance || !instance.s || !instance.s.pkFactory) throw new Error('Unable to find full path instance.s.pkFactory');

            let hookResult = instance.s.pkFactory.hooks_before[hook](query);
            if(typeof hookResult !== 'object') throw new Error('Hook result must be a object!');

            if(options.idStrategy){
                Object.assign(hookResult, {_id: options.idStrategy()});
            }
            return hookResult;
        }

        hooks.forEach(hook => {
            const _super = mongodb.Collection.prototype[hook];
            if(typeof _super !== "function") throw new Error(`Prototype for ${hook} not found in mongodb package`);
            mongodb.Collection.prototype[hook] = function(...args){

                if(this.s.pkFactory.hooks_before[hook]){
                    switch(hook){
                        case 'insert': case 'updateOne': case 'replaceOne': case 'insertOne':
                            Object.assign(args[0], validateHookResult(hook, this, args[0]));
                        default:
                            for (let index = 0; index < args[0].length; index++) {
                                Object.assign(args[0][index], validateHookResult(hook, this, args[0][index]));
                            }
                        break;
                    }
                }
                return _super.apply(this, args);
            }
        })
    }
}