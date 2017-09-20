## Overview

DevDay is a monthly informal event for developers to share their experiences, ideas, opinions, and perspectives about technology.

## Description

This is a single page app powered by the following technologies:
* [Cycle.js](https://cycle.js.org/) - A functional and reactive JavaScript framework for predictable code.
* [Webpack](https://webpack.js.org/) - A highly configurable module bundler.
* [TypeScript](https://www.typescriptlang.org/) - JavaScript that scales.
* [Sass](http://sass-lang.com/) - Syntactically awesome style sheets.
* [Cypress](https://www.cypress.io/) - Testing, the way it should be.
* [Mocha](https://mochajs.org/) - The fun, simple, flexible JavaScript testing framework.
* [Chai](http://chaijs.com/) - An assertion library for node and the browser.

## Getting started

Data is currently in the form of an object in `src/data/events.ts`. New events can be updated here. We will be moving this out of the frontend app shortly.

## Notes

This project requires at least Node.js v8.5 and NPM v5.2.

## Deployment

This project has [continuous delivery setup with CircleCI](https://circleci.com/gh/sahajsoft/devday).
Any changes to master are immediately deployed. So the branch is protected.
Make your changes in a branch, add a pull request, and merge it to master instead.
