#!/usr/bin/env node
require('@babel/polyfill');
require('../lib/cli')(process.argv.slice(2));
