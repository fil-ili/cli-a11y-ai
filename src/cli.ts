#!/usr/bin/env node

import { run } from './run';

const args = process.argv.slice(2);
const path = args[0] || process.cwd();
const includeDir = args[1] || null;

run(path, includeDir)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
