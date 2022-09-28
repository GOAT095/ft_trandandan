#!/bin/bash

npm install -g npm-check-updates
ncu -u
npm install #--force
npm run start:dev

tail -f