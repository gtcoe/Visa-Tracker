import asyncHooks from "async_hooks";

interface RequestContext {
  [key: string]: any; // Define your context structure
}

// A Map to store the current context
const contextMap: Map<number, RequestContext> = new Map();

// Create async hooks with init & destroy callbacks
asyncHooks
  .createHook({
    init: (asyncId: number, type: string, triggerAsyncId: number) => {
      if (contextMap.has(triggerAsyncId)) {
        contextMap.set(asyncId, contextMap.get(triggerAsyncId)!);
      }
    },
    destroy: (asyncId: number) => {
      contextMap.delete(asyncId);
    },
  })
  .enable();

/**
 * Sets a request context for the current async execution.
 * @param contextObject - The context to store.
 */
export const setRequestContext = (contextObject: RequestContext): void => {
  contextMap.set(asyncHooks.executionAsyncId(), contextObject);
};

/**
 * Retrieves the request context for the current async execution.
 * @returns The stored context object or `undefined` if not set.
 */
export const getRequestContext = (): RequestContext | undefined => {
  return contextMap.get(asyncHooks.executionAsyncId());
};
