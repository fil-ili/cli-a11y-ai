#!/usr/bin/env node

import { program } from 'commander';
import { run } from './run';
import { errorLog } from './utils';
import { validateApiKey } from './validateApiKey';

program
  .name('cli-a11y-ai')
  .description('Analyze accessibility on a given path using an AI service')
  .argument('[path]', 'Path to file or directory to analyze', '.')
  .option('-k, --api-key <key>', 'API key for Replicate service')
  .action(async (pathArg, options) => {
    const pathToAnalyze = pathArg || '.'; // default if user doesn't supply it
    const apiKey = options.apiKey || process.env.REPLICATE_API_KEY;

    if (!apiKey) {
      errorLog(
        'No API key provided. Please set REPLICATE_API_KEY in your environment or pass it via -k <key>.'
      );
      process.exit(1);
    }

    const isApiKeyValid = await validateApiKey(apiKey);
    if (!isApiKeyValid) {
      errorLog('The provided API key is invalid or expired.');
      process.exit(1);
    }

    await run(pathToAnalyze, apiKey);
  });

program.parse(process.argv);
