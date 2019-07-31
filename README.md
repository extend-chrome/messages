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

An API for Chrome extension messages that makes sense.

## Table of Contents

- [Getting Started](#getting_started)
- [Usage](#usage)
- [Features](#features)

## Getting started <a name = "getting_started"></a>

You will need to use a bundler like [Rollup](https://rollupjs.org/guide/en/) or Webpack to include this library in the build of Chrome extension. 

See [`rollup-plugin-chrome-extension`](https://github.com/@bumble/rollup-plugin-chrome-extension) for an easy way use Rollup to build your Chrome extension!

### Installation

```sh
$ npm i @bumble/messages
```

## Usage <a name = "usage"></a>

For one-way messages, use `send` and `on`: 

```javascript
// content-script.js
import * as messages from "@bumble/messages";

messages.send({ greeting: 'hello' })
```

```javascript
// background.js
import * as messages from "@bumble/messages";

messages.on((message, sender) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')
  }
})
```

If you need a response, use `asyncSend` and `asyncOn`:

```javascript
// content-script.js
import * as messages from "@bumble/messages";

messages.asyncSend({ greeting: 'hello' })
  .then((response) => {
    if (response.greeting === 'goodbye') {
      console.log('they said goodbye')
    }
  })
```

```javascript
// background.js
import * as messages from "@bumble/messages";

messages.asyncOn((message, sender, sendResponse) => {
  if (message.greeting === 'hello') {
    console.log(sender.id, 'said hello')

    sendResponse({ greeting: 'goodbye' })
  }
})
```


## Features <a name = "features"></a>

### TypeScript Definitions <a name = "typescript"></a>

TypeScript definitions are included, so no need to install an additional `@types` library!