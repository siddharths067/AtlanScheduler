#!/bin/sh

sleep 10s
node ./bin/www | node worker.js | node worker.js | node worker.js