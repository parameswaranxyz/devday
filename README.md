## Overview

DevDay is a monthly informal event for developers to share their experiences, ideas, opinions, and perspectives about technology.

## Getting started

* Node.js v8.5, NPM v5 required: `npm install`
* Cycle.js front-end: `npm start` (http://localhost:3000)
* Express node server back-end : `node server.js` - (http://localhost:5000)

## Deployment

* Log in to the EC2 instance as `devday`
* Go to `/home/devday/devday` and run the following commands

starting for the first time
```
NODE_ENV=production pm2 start server.js --name="devday" -i 3
```
starting otherwise
```
$ git pull
$ npm install
$ pm2 reload devday -i 3
```
