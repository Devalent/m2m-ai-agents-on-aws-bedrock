import * as dotenv from 'dotenv';

dotenv.config();

import * as bedrock from '@resources/bedrock';
import * as emoji from 'node-emoji';
import { terminal } from 'terminal-kit';

// A script to dispose AWS Bedrock resources,
// since there is currently no CloudFormation support available.

const run = async () => {
  terminal.grey('Disposing Bedrock resources...\n');

  try {
    await bedrock.dispose();
  } catch (error) {
    terminal.red(`Dispose has failed ${emoji.get('rotating_light')}\n\n${error.message}\n\n`);
    process.exit(1);
  }

  terminal.green(`Resources disposed successfully ${emoji.get('rocket')}\n`);
};

run();
