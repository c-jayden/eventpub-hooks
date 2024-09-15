interface PubSubConfig {
  maxSubscribers?: number;
  logLevel?: "error" | "warn" | "info" | "debug";
  asyncTimeout?: number;
}

const defaultConfig: PubSubConfig = {
  maxSubscribers: Infinity,
  logLevel: "error",
  asyncTimeout: 10000,
};

type EventKey = string | number;

type EventMap = {
  [K in EventKey]: (...args: any[]) => void | Promise<void>;
};

type Subscriber = (...args: any[]) => void | Promise<void>;

interface PubSub {
  publish: <K extends EventKey>(
    key: K,
    ...args: Parameters<EventMap[K]>
  ) => Promise<void>;
  publishSync: <K extends EventKey>(
    key: K,
    ...args: Parameters<EventMap[K]>
  ) => void;
  publishAll: (...args: any[]) => Promise<void>;
  publishAllSync: (...args: any[]) => void;
  subscribe: <K extends EventKey>(key: K, callback: EventMap[K]) => () => void;
  unsubscribe: <K extends EventKey>(key: K, callback: EventMap[K]) => void;
  clear: () => void;
  debug: {
    getSubscribersCount: (key: EventKey) => number;
    getAllKeys: () => EventKey[];
  };
}

const eventMap = new Map<EventKey, Set<Subscriber>>();

/**
 * Log messages based on the config log level.
 * @param level - Log level of the message.
 * @param message - Message to log.
 * @param config - The configuration object.
 */
const log = (
  level: "error" | "warn" | "info" | "debug",
  message: string,
  config: PubSubConfig
) => {
  const levels = ["error", "warn", "info", "debug"];
  const isLog = levels.indexOf(level) <= levels.indexOf(config.logLevel!);
  if (isLog) {
    console[level](message);
  }
};

/**
 * Wrap a promise with a timeout.
 * @param promise - The promise to wrap.
 * @param timeout - Timeout duration in milliseconds.
 * @returns A promise that rejects if the original promise takes longer than the specified timeout.
 */
const withTimeout = (promise: Promise<any>, timeout: number) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Async callback timeout")),
      timeout
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

/**
 * Handle errors in callback functions.
 * @param error - The error thrown by the callback.
 * @param key - (Optional) The key of the event.
 */
const handleError = (error: any, key?: EventKey) => {
  if (key) {
    console.error(`Error in event callback for key ${key}:`, error);
  } else {
    console.error("Error in event callback:", error);
  }
};

export const usePubSub = (initialConfig: Partial<PubSubConfig>): PubSub => {
  const config = { ...defaultConfig, ...initialConfig };

  /**
   * Publish an event asynchronously.
   * @param key - The key of the event.
   * @param args - Arguments to pass to the event callbacks.
   */
  const publish = async <K extends EventKey>(
    key: K,
    ...args: Parameters<EventMap[K]>
  ) => {
    const subscribers = eventMap.get(key);
    if (subscribers) {
      await Promise.all(
        Array.from(subscribers).map((callback) =>
          withTimeout(
            Promise.resolve(callback(...args)),
            config.asyncTimeout!
          ).catch((error) => handleError(error, key))
        )
      );
    }
  };

  /**
   * Publish an event synchronously.
   * @param key - The key of the event.
   * @param args - Arguments to pass to the event callbacks.
   */
  const publishSync = <K extends EventKey>(
    key: K,
    ...args: Parameters<EventMap[K]>
  ) => {
    const subscribers = eventMap.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          handleError(error, key);
        }
      });
    }
  };

  /**
   * Publish all events asynchronously.
   * @param args - Arguments to pass to all event callbacks.
   */
  const publishAll = async (...args: any[]) => {
    await Promise.all(
      Array.from(eventMap.values()).flatMap((subscribers) =>
        Array.from(subscribers).map((callback) =>
          withTimeout(
            Promise.resolve(callback(...args)),
            config.asyncTimeout!
          ).catch(handleError)
        )
      )
    );
  };

  /**
   * Publish all events synchronously.
   * @param args - Arguments to pass to all event callbacks.
   */
  const publishAllSync = (...args: any[]) => {
    eventMap.forEach((subscribers) => {
      subscribers.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          handleError(error);
        }
      });
    });
  };

  /**
   * Subscribe to an event.
   * @param key - The key of the event.
   * @param callback - The callback to invoke when the event is published.
   * @returns A function to unsubscribe from the event.
   */
  const subscribe = <K extends EventKey>(key: K, callback: EventMap[K]) => {
    if (!eventMap.has(key)) {
      eventMap.set(key, new Set());
    }
    const subscribers = eventMap.get(key)!;
    if (subscribers.size >= config.maxSubscribers!) {
      log(
        "warn",
        `Max subscribers (${config.maxSubscribers}) reached for key ${key}`,
        config
      );
      return () => {};
    }
    subscribers.add(callback);

    return () => unsubscribe(key, callback);
  };

  /**
   * Unsubscribe from an event.
   * @param key - The key of the event.
   * @param callback - The callback to unsubscribe.
   */
  const unsubscribe = <K extends EventKey>(key: K, callback: EventMap[K]) => {
    const subscribers = eventMap.get(key);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        eventMap.delete(key);
      }
    }
  };

  /**
   * Clear all subscriptions.
   */
  const clear = () => {
    eventMap.clear();
  };

  /**
   * Debug functions to inspect the internal state.
   */
  const debug = {
    getSubscribersCount: (key: EventKey) => eventMap.get(key)?.size ?? 0,
    getAllKeys: () => Array.from(eventMap.keys()),
  };

  return {
    publish,
    publishSync,
    publishAll,
    publishAllSync,
    subscribe,
    unsubscribe,
    clear,
    debug,
  };
};
