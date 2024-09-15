# eventpub-hooks

`eventpub-hooks` is a simple publish/subscribe (Pub/Sub) hooks library for JavaScript. With `eventpub-hooks`, you can implement flexible event communication between different parts of your application, making it ideal for decoupling module interactions.

[中文文档](./README-zh.md)

## Installation

You can install `eventpub-hooks` using npm or yarn:

```bash
# npm
npm install eventpub-hooks

# or yarn
yarn add eventpub-hooks

# or pnpm
pnpm add eventpub-hooks
```

## Usage

### Basic Usage

Here is an example of how to use `eventpub-hooks` in a vanilla JavaScript project:

```javascript
import { usePubSub } from "eventpub-hooks";

const { publish, subscribe } = usePubSub();

// Subscribe to an event
const unsubscribe = subscribe("eventName", (data) => {
  console.log("Event data:", data);
});

// Publish an event
publish("eventName", { example: "data" });

// Unsubscribe when no longer needed
unsubscribe();
```

### Using in a Vue Project

Using `eventpub-hooks` to perform publish/subscribe in a Vue component:

```vue
<template>
  <div>
    <button @click="emitEvent">Emit Event</button>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { usePubSub } from "eventpub-hooks";

export default defineComponent({
  setup() {
    const { publish, subscribe } = usePubSub();

    subscribe("myEvent", (data) => {
      console.log("Received data in Vue:", data);
    });

    const emitEvent = () => {
      publish("myEvent", { message: "Hello from Vue" });
    };

    return {
      emitEvent,
    };
  },
});
</script>
```

### Using in a React Project

Using `eventpub-hooks` to perform publish/subscribe in a React component:

```javascript
import React, { useEffect } from "react";
import { usePubSub } from "eventpub-hooks";

const MyComponent = () => {
  const { publish, subscribe } = usePubSub();

  useEffect(() => {
    const unsubscribe = subscribe("myEvent", (data) => {
      console.log("Received data in React:", data);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const emitEvent = () => {
    publish("myEvent", { message: "Hello from React" });
  };

  return (
    <div>
      <button onClick={emitEvent}>Emit Event</button>
    </div>
  );
};

export default MyComponent;
```

## API

### `usePubSub`

#### `publish<K extends EventKey>(key: K, ...args: Parameters<EventMap[K]>)`

Publish an event asynchronously.

- `key`: The key of the event.
- `args`: Arguments to pass to event callbacks.

#### `publishSync<K extends EventKey>(key: K, ...args: Parameters<EventMap[K]>)`

Publish an event synchronously.

- `key`: The key of the event.
- `args`: Arguments to pass to event callbacks.

#### `publishAll(...args: any[])`

Publish all events asynchronously.

- `args`: Arguments to pass to all event callbacks.

#### `publishAllSync(...args: any[])`

Publish all events synchronously.

- `args`: Arguments to pass to all event callbacks.

#### `subscribe<K extends EventKey>(key: K, callback: EventMap[K]) => () => void`

Subscribe to an event.

- `key`: The key of the event.
- `callback`: The callback to invoke when the event is published.
- Returns a function to unsubscribe from the event.

#### `unsubscribe<K extends EventKey>(key: K, callback: EventMap[K])`

Unsubscribe from an event.

- `key`: The key of the event.
- `callback`: The callback to unsubscribe.

#### `clear()`

Clear all subscriptions.

#### `debug`

Debug functions.

- `getSubscribersCount(key: EventKey)`: Get the number of subscribers for a specific event.
- `getAllKeys()`: Get all event keys.

## Contributing

We welcome issues, pull requests, and any form of contribution. If you have any suggestions or find any bugs, please let us know.

## License

MIT © [c-jayden](https://github.com/c-jayden)
