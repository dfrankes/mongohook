/**
 * TODO: Make hooks less package specific
 * For now we have a "hacky" fix to make this package also work for meteor
 * this will change later in the future.
 */

module.exports = {
    hook: (mongodb, options) => {

        // Setup our hook methods in the mongodb Collection class
        const hooks = ['insert', 'insertOne', 'updateOne', 'replaceOne', 'update', 'insertMany', 'updateMany'];

        // Register mongohook callbacks into the prototype
        mongodb.Collection.prototype.before = function (hook, callback) {
            if (!hooks.includes(hook)) throw new Error(`Unknown hook ${hook}`);

            // Check for Meteor, this is to make the package work in Meteor
            if (typeof Meteor === 'object') {
                if (!this.hooks_before) {
                    this.hooks_before = {};
                    this.hooks_before[hook] = callback;
                }
            } else {
                if (!this.s.pkFactory.hooks_before) {
                    this.s.pkFactory.hooks_before = {};
                }
                this.s.pkFactory.hooks_before[hook] = callback;
            }
        }


        validateHookResult = (hook, instance, query) => {
            let hookResult;

            if (instance && instance.s && instance.s.pkFactory) {
                hookResult = instance.s.pkFactory.hooks_before[hook](query);
                if (typeof hookResult !== 'object') throw new Error('Hook result must be a object!');
            } else if (instance.hooks_before) {
                hookResult = instance.hooks_before[hook](query);
                if (typeof hookResult !== 'object') throw new Error('Hook result must be a object!');
            } else {
                return query;
            }

            if (options && options.idStrategy) {
                Object.assign(hookResult, { _id: options.idStrategy() });
            }
            return hookResult;
        }

        hooks.forEach(hook => {
            const _super = mongodb.Collection.prototype[hook];
            if (typeof _super === "function") {

                try {
                    mongodb.Collection.prototype[hook] = function (...args) {
                        // Check for Meteor, this is to make the package work in Meteor
                        let hooksLocation = (typeof Meteor === 'object' ? this.hooks_before : this.s.pkFactory.hooks_before);
                        if (hooksLocation && hooksLocation[hook]) {
                            let hookResult;
                            
                            switch (hook) {

                                case 'insert': case 'insertOne':
                                    hookResult = validateHookResult(hook, this, args[0]);
                                    if(hookResult){
                                        args[0] = hookResult;
                                    }
                                break;
                                case 'updateOne': case 'replaceOne': case 'update':
                                    hookResult = validateHookResult(hook, this, args[1]);
                                    if(hookResult){
                                        args[1] = hookResult
                                    }
                                break;
                                case 'insertMany':
                                    for (let index = 0; index < args[0].length; index++) {
                                        hookResult = validateHookResult(hook, this, args[0][index]);
                                        if(hookResult){
                                            args[0][index] = hookResult;
                                        }
                                    }
                                break;
                                case 'updateMany':
                                    for (let index = 0; index < args[1].length; index++) {
                                        hookResult = validateHookResult(hook, this, args[1][index]);
                                        if(hookResult){
                                            args[1][index] = hookResult;
                                        }
                                    }
                                break;
                                default:

                                break;
                            }
                        }
                        return _super.apply(this, args);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })
    }
}