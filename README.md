<!--
Template tags:
extend-chrome
messages
@extend-chrome
https://imgur.com/cKFLQ0o.png
-->

<p align="center">
  <a href="https: //github.com/extend-chrome/messages" rel="noopener">
  <img width=200px height=200px src="https://imgur.com/XYtiJBw.png" alt="@extend-chrome/messages logo"></a>
</p>

<h3 align="center">@extend-chrome/messages</h3>

<div align="center">

[![npm (scoped)](https://img.shields.io/npm/v/@extend-chrome/messages.svg)](https://www.npmjs.com/package/@extend-chrome/messages)
[![GitHub last commit](https://img.shields.io/github/last-commit/extend-chrome/messages.svg)](https://github.com/extend-chrome/messages)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![TypeScript Declarations Included](https://img.shields.io/badge/types-TypeScript-informational)](#typescript)

</div>

<div align="center">

[![Fiverr: We make Chrome extensions](https://img.shields.io/badge/Fiverr%20-We%20make%20Chrome%20extensions-brightgreen.svg)](https://www.fiverr.com/jacksteam)
[![ko-fi](https://img.shields.io/badge/ko--fi-Buy%20me%20a%20coffee-ff5d5b)](https://ko-fi.com/K3K1QNTF)

</div>

---

An API for Chrome extension messaging that makes sense. Uses Promises and
Observables for convenience.

## Table of Contents

- [Getting Started](#getting_started)
- [Usage](#usage)
- [Features](#features)
- [API](#api)

## Getting started <a name = "getting_started"></a>

You will need to use a bundler like [Rollup](https://rollupjs.org/guide/en/),
Parcel, or Webpack to include this library in the build of Chrome extension.

See
[`rollup-plugin-chrome-extension`](https://github.com/extend-chrome/rollup-plugin-chrome-extension)
for an easy way use Rollup to build your Chrome extension!

### Installation

```sh
$ npm i @extend-chrome/messages
```

## Usage <a name = "usage"></a>

Send and receive messages using isomorphic message wrappers, or with a
traditional messages object.

```javascript
// messages.js, used in both the background and content script
import { getMessage } from '@extend-chrome/messages'

// getMessage returns [Function, Observable, Function]
export const [sendNumber, numberStream, waitForNumber] = getMessage(
  // String to be used as a greeting
  'NUMBER',
)
```

```javascript
// background.js, a background script
import { numberStream } from './messages'

// numberStream is an RxJs Observable
numberStream.subscribe(([n, sender]) => {
  console.log('the data passed to sendNumber', n)
  // Sender is a Chrome runtime MessageSender
  console.log('the message sender', sender)
})
```

```javascript
// content.ts, a content script
import { sendNumber } from './messages'

document.body.onclick = () => {
  sendNumber(42) // 42 is logged in the background
}
```

### `getMessage` has great TypeScript support!

If you're into TypeScript, `getMessage` is a generic function. It shines when
you define the message data type. No more message data type mistakes!
Intellisense has you covered.

```typescript
// messages.ts
import { getMessage } from '@extend-chrome/messages'

interface Stats {
  hi: number
  low: number
  date: string
}

export const [sendStats, statsStream, waitForStats] = getMessage<Stats>('STATS')

// If you have a message type with no data, use void rather than undefined
// This way you can call it with zero arguments
export const [sendReady, readyStream, waitForReady] = getMessage<void>('READY')
```

```typescript
// background.ts
import { statsStream } from './messages'

statsStream.subscribe(([{ hi, lo, date }, sender]) => {
  // Intellisense knows this is an Observable of
  // [Stats, chrome.runtime.MessageSender]
})

waitForReady().then(() => {
  console.log('content.ts is ready')
})
```

```typescript
// content.ts
import { sendStats } from './messages'

sendStats({ hi: 30, low: 14, date: '11/12/2019' })

// Throws a TS error
sendStats('not a Stats object')

sendReady()
```

## Features <a name = "features"></a>

### TypeScript Definitions <a name = "typescript"></a>

This library is written in TypeScript, extensively typed, and definitions are
included, so no need to install an additional `@types` library!

### RxJs Observables

Version 0.5.0 introduces an
[RxJs Observable](https://rxjs-dev.firebaseapp.com/guide/overview) as
[`messages.stream`](#api-messages-stream).

### Scopes

Version 0.5.0 introduces [`getScope`](#api-use-scope), a way to use a separate
messaging space.

This is useful if you are writing a library for Chrome extensions that uses
messages internally, but you don't want to pollute the global messaging space.

## API <a name = "api"></a>

### `getMessage(greeting)`

```javascript
import { getMessage } from '@extend-chrome/messages'

const [sendMessage, messageStream, waitForMessage] = getMessage('greeting')
```

Use this function to create an isomorphic message system. Import it into both
the message sender and receiver context (ie, the background page and a content
script). `getMessage` is a TypeScript generic function. See the [Usage](#usage)
section for more information, including TypeScript support!

#### `greeting`

> Type: `string`

A unique string to identify the message.

#### Returns: `[messageSender, messageStream]`

> Type: `[Function, Observable]`

Import the messageSender into the context you wish to send a message. Call the
sender with the data you want to send.

`messageStream` is an Observable of a `[data, MessageSender]` tuple. Import the
messageStream into the context you wish to recieve messages. Subscribe to it
with a message handler function.

### The `messages` Namespace

If you're more comfortable with a traditional messages namespace, import the
`messages` object.

#### `messages.send(data, [options])` <a name = "api-messages-send"></a>

Sending one-way messages is simple: just call `messages.send` with an object
that includes at least a `greeting` property.

```javascript
// content-script.js
import { messages } from '@extend-chrome/messages'

// Simple message with no data
messages.send({ greeting: 'hello' }).then(() => {
  console.log('The message was sent.')
})

// Message with data
messages
  .send({
    greeting: 'with-data',
    // You can use any prop name or value
    data: { x: 1 },
  })
  .then(() => {
    console.log('The message was sent.')
  })
```

Actually, you can send any data type as a message, but an object with a
`greeting` prop is a nice, flexible pattern.

##### Get a response with `options.async` <a name = "api-messages-send-async"></a>

Set the optional `options.async` to `true` to receive a response. Only message
listeners with the third `sendResponse` argument will receive async messages.

```javascript
// content-script.js
import { messages } from '@extend-chrome/messages'

messages
  .send(
    // Message
    { greeting: 'hello' },
    // Options
    { async: true },
  )
  .then((response) => {
    console.log('They said', response.greeting)
  })
```

#### `messages.on(handler)` <a name = "api-messages-on"></a>

To receive one way messages, use a message handler function with 0 or 1
arguments. This handler will only receive messages sent without the async
option.

The return value of the handler is unused.

```javascript
// background.js
import * as messages from '@extend-chrome/messages'

// Listener should have 2, 1, or 0 arguments
messages.on((message, sender) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')
  }
})
```

##### Async Messages <a name = "api-messages-on-async"></a>

> I've found relying on async messages to be a bit of an anti-pattern. Chrome is
> pretty aggressive about closing the response port, so unless you're doing
> something synchronous, it's better to use a separate message and use a
> listener to handle responses.

To receive async messages, use a message handler with 3 arguments. This handler
will only receive messages sent with the async option.

The third argument is a `sendResponse` function, which must be called very
quickly, or Chrome will throw an error. Even a single await may make the extension unreliable.

```javascript
// Async functions are OK!
messages.on(async (message, sender, sendResponse) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')

    await somethingAsync()

    // Still need to call sendResponse
    sendResponse({ greeting: 'goodbye' })
  }
})
```

#### `messages.off(handler)` <a name = "api-messages-off"></a>

Call this with the message handler function you wish to stop using.

#### `messages.stream` <a name = "api-messages-stream"></a>

> Type: `Observable`

An Observable of all messages in its scope.

```typescript
import { messages } from '@extend-chrome/messages'

// Receives all messages in the default scope
messages.stream.subscribe(([message, sender, sendResponse]) => {
  if (typeof sendResponse !== 'undefined') {
    // If sendResponse is defined, it must be called
    sendResponse({ greeting: 'message received!' })
  }
})
```

### `getScope` <a name = "api-use-scope"></a>

This is useful if you are writing a library for Chrome extensions that uses
messages internally, but you don't want to pollute the global messaging space.

```javascript
import { messages, getScope } from '@extend-chrome/messages'

const myScope = getScope('my-library')

// `messages.on` will not receive this message
myScope.send({ greeting: 'hey' })

// `myScope.on` will not receive this message
messages.send({ greeting: 'hello?' })
```

> Note: The Chrome API Event `chrome.runtime.onMessage` will still receive all
> messages, but projects using `@extend-chrome/messages` will not receive messages from
> other scopes.
