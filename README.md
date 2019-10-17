<!--
Template tags:
bumble-org
messages
@bumble
https://imgur.com/cKFLQ0o.png
-->

<p align="center">
  <a href="https: //github.com/bumble-org/messages" rel="noopener">
  <img width=200px height=200px src="https://imgur.com/cKFLQ0o.png" alt="@bumble/messages logo"></a>
</p>

<h3 align="center">@bumble/messages</h3>

<div align="center">

[![npm (scoped)](https://img.shields.io/npm/v/@bumble/messages.svg)](https://www.npmjs.com/package/@bumble/messages)
[![GitHub last commit](https://img.shields.io/github/last-commit/bumble-org/messages.svg)](https://github.com/bumble-org/messages)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![TypeScript Declarations Included](https://img.shields.io/badge/types-TypeScript-informational)](#typescript)

</div>

<div align="center">

[![Fiverr: We make Chrome extensions](https://img.shields.io/badge/Fiverr%20-We%20make%20Chrome%20extensions-brightgreen.svg)](https://www.fiverr.com/jacksteam)
[![ko-fi](https://img.shields.io/badge/ko--fi-Buy%20me%20a%20coffee-ff5d5b)](https://ko-fi.com/K3K1QNTF)

</div>

---

An API for Chrome extension messaging that makes sense. Uses Promises and optional Observables for convenience.

## Table of Contents

- [Getting Started](#getting_started)
- [Usage](#usage)
- [Features](#features)
- [API](#api) _(coming soon)_

## Getting started <a name = "getting_started"></a>

You will need to use a bundler like [Rollup](https://rollupjs.org/guide/en/), Parcel, or Webpack to include this library in the build of Chrome extension.

See [`rollup-plugin-chrome-extension`](https://github.com/bumble-org/rollup-plugin-chrome-extension) for an easy way use Rollup to build your Chrome extension!

### Installation

```sh
$ npm i @bumble/messages
```

## Usage <a name = "usage"></a>

Sending one-way messages is simple:

```javascript
// content-script.js
import { messages } from '@bumble/messages'

messages.send({ greeting: 'hello' }).then(() => {
  console.log('The message was sent.')
})
```

```javascript
// background.js
import * as messages from '@bumble/messages'

// Listener should have 2, 1, or 0 arguments
messages.on((message, sender) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')
  }
})
```

If you need a response, use the `options` parameter:

```javascript
// content-script.js
import { messages } from '@bumble/messages'

messages
  .send({ greeting: 'hello' }, { async: true })
  .then((response) => {
    console.log('They said', response.greeting)
  })
```

To listen for async messages, include a third argument in the event listener.

```javascript
// background.js
import * as messages from '@bumble/messages'

// Listener should have exactly 3 arguments
messages.on((message, sender, sendResponse) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')

    // You must call sendResponse eventually
    sendResponse({ greeting: 'goodbye' })
  }
})

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

## Features <a name = "features"></a>

### TypeScript Definitions <a name = "typescript"></a>

This library is written in TypeScript, extensively typed, and definitions are included, so no need to install an additional `@types` library!

### RxJs Observables

Version 0.5.0 includes an Observable as `messages.stream`.

```typescript
import { messages } from '@bumble/messages'

messages.stream.subscribe(([message, sender, sendResponse]) => {
  if (typeof sendResponse !== 'undefined') {
    sendResponse({ greeting: 'message received!' })
  }
})
```

### Lines

Version 0.5.0 introduces `useLine`, a convenient way to setup your messaging system.

```javascript
// messages.js
import { messages } from '@bumble/messages'

export const [sendNumber, numberStream] = messages.useLine(
  'NUMBER',
)
```

```javascript
// background.js, a background script
import { numberStream } from './messages'

numberStream.subscribe((n) => {
  console.log('the number is', n)
})
```

```javascript
// content.ts, a content script
import { sendNumber } from './messages'

document.body.onclick = () => {
  sendNumber(42) // 42 is logged in the background
}
```

### Scopes

Version 0.5.0 introduces `useScope`, a way to use a separate messaging space.

This is useful if you are writing a library for Chrome extensions that uses messages internally, but you don't want to pollute the global messaging space.

```javascript
import { messages, useScope } from '@bumble/messages'

const myScope = useScope('my-library')

// `messages.on` will not receive this message
myScope.send({ greeting: 'hey' })

// `myScope.on` will not receive this message
messages.send({ greeting: 'hello?' })
```

> Note: The Chrome API Event `chrome.runtime.onMessage` will still receive all messages, but projects using `@bumble/messages` will not receive messages from other scopes.

## API <a name = "api"></a>

### `messages.send`

### `messages.on`

### `messages.off`

### `messages.stream`

### `messages.useLine`

### `useScope`
