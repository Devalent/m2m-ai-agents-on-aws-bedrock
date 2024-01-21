import * as agentConfig from '@config/agent';
import * as bedrock from '@resources/bedrock';
import * as fs from 'fs';
import * as emoji from 'node-emoji';
import * as path from 'path';
import { terminal } from 'terminal-kit';

// A script to deploy and dispose AWS Bedrock resources,
// since there is currently no CloudFormation support available.

const envpath = path.resolve(__dirname, '../.env');

const run = async () => {
  terminal.grey('Deploying Bedrock resources...\n');

  try {
    const { agentId, actionGroupId, agentAliasId } = await bedrock.deploy();

    if (fs.existsSync(envpath)) {
      fs.rmSync(envpath);
    }

    const data = [
      `BEDROCK_AGENT_ID=${agentId}`,
      `BEDROCK_ACTION_GROUP_ID=${actionGroupId}`,
      `BEDROCK_AGENT_ALIAS_ID=${agentAliasId}`,
    ].join('\n');

    terminal.grey(`${data}\n`);

    fs.writeFileSync(envpath, data);
  } catch (error) {
    terminal.red(`Deployment has failed ${emoji.get('rotating_light')}\n\n${error.message}\n\n`);
    terminal.yellow(
      `Make sure that you have requested access to ${agentConfig.foundationModel} foundation model in AWS Bedrock console.\n`,
    );
    process.exit(1);
  }

  terminal.green(`Resources deployed successfully ${emoji.get('rocket')}\n`);
};

run();
