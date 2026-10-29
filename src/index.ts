#!/usr/bin/env node

import { program } from 'commander';
import { run } from './run';
import { errorLog } from './utils';
import { validateApiKey } from './validateApiKey';

program.option('-k, --api-key <key>', 'API key for Replicate service');

program.parse(process.argv);
const options = program.opts();

// Use the provided key or fallback to the one from .env
const apiKey = options.apiKey || process.env.REPLICATE_API_KEY;

if (!apiKey) {
  errorLog(
    'No API key provided. Please set REPLICATE_API_KEY in your environment, or pass it using the -k option.'
  );
  process.exit(1);
}

async function main() {
  const isApiKeyValid = await validateApiKey(apiKey);

  if (!isApiKeyValid) {
    errorLog('The provided API key is invalid or expired.');
    process.exit(1);
  }

  await run();
}

main();
