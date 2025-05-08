# Simple Example Usage For `@coursebook/file-watcher`

This is a minimal example showing how to use `@coursebook/file-watcher` package in a local project. The example demonstrates how to watch a directory for changes and log them.

## Setup

```bash
npm install
```

## Run the Example

```bash
npm run start
``` 

## How does it work?

The `@coursebook/file-watcher` is a local package that is installed using the `file:` protocol; see the `dependencies` section in the `package.json` file:

```json
  "dependencies": {
    "@coursebook/file-watcher": "file:../../packages/file-watcher"
  },
```

If you want to use the package through NPM, you can do so by changing the `dependencies` section in the `package.json` file to:

```json
  "dependencies": {
    "@coursebook/file-watcher": "latest"
  },
```

Then install the dependencies again and it will be installed through NPM (assuming you have published the package to NPM).
