#!/usr/bin/env node
const path = require('path')

process.env.ORIGINAL_WD = process.cwd()
process.chdir(path.join(__dirname, 'lib'))

require(path.join(__dirname, 'lib/boot/Cli.js'))
