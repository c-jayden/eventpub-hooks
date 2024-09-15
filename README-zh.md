# eventpub-hooks

`eventpub-hooks` 是一个为 JavaScript 设计的简易发布/订阅（Pub/Sub）模式的 Hooks 库。通过 `eventpub-hooks`，你可以在程序的不同部分之间实现灵活的事件通信，非常适用于解耦模块之间的通信。

## 安装

你可以使用 npm 或 yarn 安装 `eventpub-hooks`：

```bash
# npm
npm install eventpub-hooks

# 或 yarn
yarn add eventpub-hooks

# 或 pnpm
pnpm add eventpub-hooks
```

## 使用方法

### 基本使用

以下是如何在原生 JavaScript 项目中使用 `eventpub-hooks` 的例子：

```javascript
import { usePubSub } from "eventpub-hooks";

const { publish, subscribe } = usePubSub();

// 订阅一个事件
const unsubscribe = subscribe("eventName", (data) => {
  console.log("Event data:", data);
});

// 发布一个事件
publish("eventName", { example: "data" });

// 不再需要时取消订阅
unsubscribe();
```

### 在 Vue 项目中使用

在 Vue 组件中使用 `eventpub-hooks` 进行发布/订阅：

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

### 在 React 项目中使用

在 React 组件中使用 `eventpub-hooks` 进行发布/订阅：

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

异步发布事件。

- `key`: 事件的键。
- `args`: 传递给事件回调的参数。

#### `publishSync<K extends EventKey>(key: K, ...args: Parameters<EventMap[K]>)`

同步发布事件。

- `key`: 事件的键。
- `args`: 传递给事件回调的参数。

#### `publishAll(...args: any[])`

异步发布所有事件。

- `args`: 传递给每个事件回调的参数。

#### `publishAllSync(...args: any[])`

同步发布所有事件。

- `args`: 传递给每个事件回调的参数。

#### `subscribe<K extends EventKey>(key: K, callback: EventMap[K]) => () => void`

订阅事件。

- `key`: 事件的键。
- `callback`: 事件触发时调用的回调函数。
- 返回一个取消订阅的函数。

#### `unsubscribe<K extends EventKey>(key: K, callback: EventMap[K])`

取消订阅事件。

- `key`: 事件的键。
- `callback`: 要取消的回调函数。

#### `clear()`

清除所有订阅。

#### `debug`

调试函数。

- `getSubscribersCount(key: EventKey)`: 获取指定事件的订阅者数量。
- `getAllKeys()`: 获取所有事件的键。

## 贡献

欢迎提交 issue、pull requests 和任何形式的贡献。如果你有任何建议或发现了 bug，请随时告诉我们。

## 许可证

MIT © [c-jayden](https://github.com/c-jayden)
