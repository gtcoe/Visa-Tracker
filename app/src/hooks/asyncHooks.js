// const asyncHooks = require('async_hooks');

// // A Map to store current context
// const contextMap = new Map();

// // create hook with callbacks and enable
// asyncHooks.createHook({
// 	init: (asyncId, type, triggerAsyncId) => {
// 		if (contextMap.has(triggerAsyncId)) {
// 			contextMap.set(asyncId, contextMap.get(triggerAsyncId))
// 		}
// 	},
// 	destroy: (asyncId) => {
// 		if (contextMap.has(asyncId)) {
// 			contextMap.delete(asyncId);
// 		}
// 	}
// }).enable();

// // set value in map
// const setRequestContext = (contextObject) => {
// 	contextMap.set(asyncHooks.executionAsyncId(), contextObject);
// };

// // get value from map
// const getRequestContext = () => {
// 	return contextMap.get(asyncHooks.executionAsyncId());
// };

// module.exports = {setRequestContext, getRequestContext};
