# Frequently Asked Questions

## Where did the `dist` folder go?

Starting with version 1.9.0, a minified browser bundle can be obtained from npm CDNs such as [unpkg](https://unpkg.com/) or [jsDelivr](https://www.jsdelivr.com/). The link can be found in the [README.md](README.md).

In prior versions, the browser bundles were made available in the `dist` directory. In order to access those, look in the `dist` folder on the version's GitHub tag, e.g. https://github.com/algorand/js-algorand-sdk/tree/v1.8.1/dist.

## Can I host the browser bundle myself?

Yes! If you would instead prefer to host the package yourself, a minified browser bundle can be found in the `dist/browser/` folder of the published npm package starting with version 1.9.0.

## It says `Error: Can't resolve....` in the sdk

This kind of errors is usually seen in Webpack 5 or Vite projects. You will need to install additional polyfill packages.

#### Webpack 5 projects

Typically, with Webpack 5 you would see:

```
Module not found: Error: Can't resolve 'crypto'
ERROR in ./node_modules/algosdk/dist/browser/algosdk.min.js 7471:55-72
```

Webpack 5 no longer auto-polyfills some of the node modules used by this sdk. You will have to polyfill them to fix any errors regarding missing modules.

#### Vite projects

With Vite, you would see:

```
Uncaught ReferenceError: Buffer is not defined
```

You will have to install `buffer` and `path-browserify` as dependencies.

In `vite.config.js`, specify:

```js
resolve: {
  alias: {
    path: 'path-browserify';
  }
}
```

In `index.html`, add the following:

```html
<script type="module">
  import { Buffer } from 'buffer';
  window.Buffer = Buffer;
</script>
```

To utilize the Buffer polyfill in production builds, in `vite.config.js`, add:

```js
import inject from '@rollup/plugin-inject';

export default defineConfig({
  ...,
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    },
  },
  ...
});
```

## How do I generate the SRI hash of `algosdk.min.js`?

The SRI hash of `algosdk.min.js` is the base64 string after `sha384-` in the `integrity` attribute of the `<script>` tag used to import `algosdk.min.js`.
See the [instructions to import algosdk in browser](./README.md#Browser).
It can be computed as follows after [building the project](./README.md#building):

```bash
cat dist/browser/algosdk.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```
