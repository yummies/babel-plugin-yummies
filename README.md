[![npm](https://img.shields.io/npm/v/@yummies/babel-plugin-yummies.svg?style=flat-square)](https://www.npmjs.com/package/@yummies/babel-plugin-yummies)
[![travis](http://img.shields.io/travis/yummies/babel-plugin-yummies.svg?style=flat-square)](https://travis-ci.org/yummies/babel-plugin-yummies)
[![deps](http://img.shields.io/david/yummies/babel-plugin-yummies.svg?style=flat-square)](https://david-dm.org/yummies/babel-plugin-yummies)
[![gitter](http://img.shields.io/badge/gitter-join_chat-brightgreen.svg?style=flat-square)](https://gitter.im/yummies/yummies)

Babel plugin that implements multilayer components inheritance for [Yummies](https://github.com/yummies/yummies).

## Install

```
npm i -S @yummies/babel-plugin-yummies
```

## Usage

`.babelrc`:

```js
{
  …
  "plugins": [ "@yummies/babel-plugin-yummies" ]
}
```

## Process

* find all the special `require('#…')`s (which starts with `#` symbol)
* run through `layers` dirs array (defined in `.yummies.yml` in the root of project) and collect a CHAIN of existing files in special order
* rewrite original `require('#…')` with `require('yummies').yummify(CHAIN)`

## Examples

### Simple

fs:

```
.
└── src/
    ├── core-components/
    │   └── example/
    │       └── index.js
    └── my-components/
        └── example/
            └── index.js
```

config:

```yaml
files:
  main: index.js

layers:
  - src/core-components/
  - src/my-components/
```

source:

```js
import Example from '#example';
```

result:

```js
var Example = require('yummies').yummify([
    {
        type: 'main',
        module: require('./src/core-components/example/index.js')
    },
    {
        type: 'main',
        module: require('./src/my-components/example/index.js')
    }
]);
```

### Styles

fs:

```
.
└── src/
    ├── core-components/
    │   └── example/
    │       ├── index.js
    │       └── styles.less
    └── my-components/
        └── example/
            ├── index.js
            └── styles.less
```

config:

```yaml
files:
  main: index.js
  styles: styles.less

layers:
  - src/core-components/
  - src/my-components/
```

source:

```js
import Example from '#example';
```

result:

```js
var Example = require('yummies').yummify([
    {
        type: 'main',
        module: require('./src/core-components/example/index.js')
    },
    {
        type: 'styles',
        module: require('./src/core-components/example/styles.less')
    },
    {
        type: 'main',
        module: require('./src/my-components/example/index.js')
    },
    {
        type: 'styles',
        module: require('./src/my-components/example/styles.less')
    }
]);
```

### propTypes

Resulted Class will have `propTypes` static property with [React propTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) collected and extended through layers.

fs:

```
.
└── src/
    ├── core-components/
    │   └── example/
    │       ├── index.js
    │       └── prop-types.js
    └── my-components/
        └── example/
            ├── index.js
            └── prop-types.js
```

config:

```yaml
files:
  main: index.js
  propTypes: prop-types.js

layers:
  - src/core-components/
  - src/my-components/
```

source:

```js
import Example from '#example';
```

result:

```js
var Example = require('yummies').yummify([
    {
        type: 'main',
        module: require('./src/core-components/example/index.js')
    },
    {
        type: 'propTypes',
        module: require('./src/core-components/example/prop-types.js')
    },
    {
        type: 'main',
        module: require('./src/my-components/example/index.js')
    },
    {
        type: 'propTypes',
        module: require('./src/my-components/example/prop-types.js')
    }
]);
```

### Mods

fs:

```
.
└── src/
    ├── core-components/
    │   └── example/
    │       ├── _type/
    │       │   └── test/
    │       │       └── index.js
    │       ├── index.js
    │       └── styles.less
    └── my-components/
        └── example/
            ├── _type/
            │   └── test/
            │       └── styles.less
            ├── index.js
            └── styles.less
```

config:

```yaml
files:
  main: index.js
  styles: styles.less

layers:
  - src/core-components/
  - src/my-components/
```

source:

```js
import ExampleTypeTest from '#example?_type=test';
```

result:

```js
var ExampleTypeTest = require('yummies').yummify([
    {
        type: 'main',
        module: require('./src/core-components/example/index.js')
    },
    {
        type: 'styles',
        module: require('./src/core-components/example/styles.less')
    },
    {
        type: 'main',
        module: require('./src/my-components/example/index.js')
    },
    {
        type: 'styles',
        module: require('./src/my-components/example/styles.less')
    },
    {
        type: 'main',
          module: require('./src/core-components/example/_type/test/index.js')
    },
    {
        type: 'styles',
        module: require('./src/my-components/example/_type/test/styles.less')
    }
]);
```

### Multiple mods

The same process as for single mod:

```js
import ExampleTypeTestSizeBig from '#example?_type=test&_size=big';
```

### Ignore styles

```js
import ExampleIndexOnly from '#example?-styles';
```

### "Raw" (call `.yummifyRaw()`)

```js
import ExampleRaw from '#example?raw';
```
