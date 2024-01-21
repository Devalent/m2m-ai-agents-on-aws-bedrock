# AWS Bedrock Agent Example

<p align="center">
  <img src="./img.png?raw=true" alt="" />
</p>

## Prerequisites

- [Node.js](https://nodejs.org/)
- [AWS CLI](https://aws.amazon.com/cli/)

## Setup

- Run `npm i`
- Go to AWS Bedrock console, then "Model Access", click "Manage model access" and check "Anthropic - Claude Instant". Submit use case details if needed.
- Make sure that the terminal has AWS credentials configured.

## Commands

- `npm run deploy` - deploy the service and all required resources to AWS (`us-east-1` region);
- `npm run dispose` - remove all deployed resources;
- `npm run invoke` - call the question API with test data (`src/functions/question/mock.json`);
- `npm run invoke:local` - same as above, but runs the function locally;
