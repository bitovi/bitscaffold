## Testing

This project uses [jest](https://jestjs.io/) for testing.

### Run all tests

You can run tests for all lerna packages from the root directory (see [/package.json](/package.json)):

```sh
npm test
```

## Linting / Code Style

Linting and code styles are enforced globally for this project (not package-specific).

Linting is handled by [eslint](https://eslint.org/). See the `lint*` scripts in [/package.json](/package.json).

Code Styles are enforced by [prettier](https://prettier.io/). See the `pretty*` scripts in [/package.json](/package.json).

## IDE / Editor

This package includes some quality-of-life configurations for Visual Studio Code, but it's not required.
