import * as dotenv from 'dotenv';

dotenv.config();

import type { AWS } from '@serverless/typescript';
import { region, stage } from '@config/aws';
import { bedrockAgentId, bedrockActionGroupId, bedrockAgentAliasId } from '@config/env';
import api from '@functions/api';
import question from '@functions/question';

const serverlessConfiguration: AWS = {
  service: 'm2m-ai',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    region,
    stage,
    name: 'aws',
    runtime: 'nodejs20.x',
    timeout: 29,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      BEDROCK_AGENT_ID: bedrockAgentId,
      BEDROCK_ACTION_GROUP_ID: bedrockActionGroupId,
      BEDROCK_AGENT_ALIAS_ID: bedrockAgentAliasId,
      TABLE_ANSWERS: { Ref: 'TableAnswers' },
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['bedrock:InvokeAgent'],
        Resource: [
          {
            'Fn::Join': [
              '',
              [
                'arn:aws:bedrock:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':agent-alias/',
                bedrockAgentId,
                '/',
                bedrockAgentAliasId,
              ],
            ],
          },
        ],
      },
      {
        Effect: 'Allow',
        Action: ['dynamodb:PutItem', 'dynamodb:GetItem'],
        Resource: [{ 'Fn::GetAtt': ['TableAnswers', 'Arn'] }],
      },
    ],
  },
  functions: { api, question },
  resources: {
    Resources: {
      // Allow Bedrock to call the agent API Lambda
      InvokePermission: {
        Type: 'AWS::Lambda::Permission',
        Properties: {
          Action: 'lambda:InvokeFunction',
          FunctionName: { 'Fn::GetAtt': ['ApiLambdaFunction', 'Arn'] },
          Principal: 'bedrock.amazonaws.com',
          SourceArn: {
            'Fn::Join': [
              '',
              ['arn:aws:bedrock:', { Ref: 'AWS::Region' }, ':', { Ref: 'AWS::AccountId' }, ':agent/', bedrockAgentId],
            ],
          },
        },
      },
      // DynamoDB table to store agent answers
      TableAnswers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:service}-answers',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
