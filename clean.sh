#!/bin/sh
rm -rf node_modules
rm yarn.lock
rm package-lock.json
yarn cache clean
rm -rf ./app/dist
yarn
./node_modules/.bin/electron-rebuild

