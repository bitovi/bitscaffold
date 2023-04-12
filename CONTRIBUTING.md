# Introduction

We are glad you are here, means you might be interested in contributing to Hatchify! Anyone can open issues and propose changes to the source code (via Pull Requests). Here are ways you can contribute to the project:

- You can open well-written bug reports, feature requests and proposals for documentation improvement via [New Issue](https://github.com/bitovi/bitscaffold/issues/new)). Please feel free to learn to use [Github markdown](https://docs.github.com/en/get-started/writing-on-github) to write a readable issue.
- Opening Pull Requests to fix bugs or make other improvements.
- Reviewing (i.e. commenting on) open Pull Requests, to help their creators improve it if needed and allow maintainers to take less time looking into them
- Helping to clarify issues opened by others, commenting and asking for clarification

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
