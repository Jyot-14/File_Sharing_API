#!/usr/bin/env node

const yargs = require('yargs');
const { execSync } = require('child_process');

// Parse the command-line arguments
const { argv } = yargs;

const name = argv._[0];
const migrationPath = `src/database/migrations/${name}`;

// Run the typeorm command
execSync(`typeorm migration:create ${migrationPath}`, { stdio: 'inherit' });
