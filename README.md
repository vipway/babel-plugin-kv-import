[![npm version](https://badge.fury.io/js/ts-import-plugin.svg)](https://www.npmjs.com/package/babel-plugin-kv-import)

# babel-plugin-kv-import

[![Greenkeeper badge](https://badges.greenkeeper.io/Brooooooklyn/ts-import-plugin.svg)](https://greenkeeper.io/)

Modular import plugin for kv-design

## Example

#### `{ "libraryName": "kv-design" }`

```javascript
import { Button } from 'kv-design';
ReactDOM.render(<Button label="xxxx" />);

      ↓ ↓ ↓ ↓ ↓ ↓

var _button = require('kv-design/lib/button');
ReactDOM.render(<_button label="xxxx" />);
```

## Usage

```bash
npm install babel-plugin-kv-import --save-dev
```

Via `.babelrc` or babel-loader.

```js
{
  "plugins": [["kv-import", options]]
}
```

### options

* libraryName `string` (require)

* style `boolean | 'less' | function`

  default `false`

* libraryDirectory `string`

  default `'lib'`

* customName `function`

* deleteImportNameContent `string`

Import name based on `deleteImportNameContent` delete path.

`options` can be an object:

```javascript
{
    libraryName: 'kv-design',
    libraryDirectory: 'lib',
    style: true
},
```

`options` can be an array.

```javascript
[
  {
    libraryName: 'kv-design',
    libraryDirectory: 'lib',
    style: true
  },
  {
    libraryName: 'kv-ui-core',
    libraryDirectory: 'lib'
  }
];
```

### style

* `["import", { "libraryName": "kv-design" }]`: import js modularly
* `["import", { "libraryName": "kv-design", "style": true }]`: import js and css modularly
* `["import", { "libraryName": "kv-design", "style": "less" }]`: import js and less modularly

### Note

If option style is a `Function`, `babel-plugin-kv-import` will auto import the file which filepath equal to the function return value.
`babel-plugin-kv-import` will not work properly if you add the library to the webpack config [vendor].
