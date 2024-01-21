import { AgentStatus, BedrockAgent } from '@aws-sdk/client-bedrock-agent';
import { IAM } from '@aws-sdk/client-iam';
import { STS } from '@aws-sdk/client-sts';
import * as agentConfig from '@config/agent';
import * as awsConfig from '@config/aws';
import * as envConfig from '@config/env';
import * as prompts from '@resources/prompts';
import { agentApiSpec } from '@resources/openapi';

const prefix = 'm2m-ai';

const aws_bedrock = new BedrockAgent({ region: awsConfig.region });
const aws_iam = new IAM({ region: awsConfig.region });
const aws_sts = new STS({ region: awsConfig.region });

/**
 * Deploy Bedrock resources.
 */
export const deploy = async () => {
  const { Account: accountId } = await aws_sts.getCallerIdentity({});

  // ====================================================================================
  // Agent role

  let agentRoleArn: string;

  {
    const roleName = `AmazonBedrockExecutionRoleForAgents_${prefix}-agent`;
    const { Roles: roles } = await aws_iam.listRoles({ MaxItems: 1000 });

    const existingRole = roles.find((r) => r.RoleName === roleName);

    if (existingRole) {
      agentRoleArn = existingRole.Arn;
    } else {
      const {
        Role: { Arn: roleArn },
      } = await aws_iam.createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AmazonBedrockAgentBedrockFoundationModelPolicyProd',
              Effect: 'Allow',
              Principal: {
                Service: 'bedrock.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
              Condition: {
                StringEquals: {
                  'aws:SourceAccount': accountId,
                },
                ArnLike: {
                  'aws:SourceArn': `arn:aws:bedrock:${awsConfig.region}:${accountId}:agent/*`,
                },
              },
            },
          ],
        }),
      });

      agentRoleArn = roleArn;
    }

    await aws_iam.attachRolePolicy({
      PolicyArn: `arn:aws:iam::aws:policy/service-role/AWSLambdaRole`,
      RoleName: agentRoleArn.split('/').pop(),
    });
  }

  // ====================================================================================
  // Agent

  let agentId: string;

  {
    const agentName = `${prefix}-agent`;
    const { agentSummaries } = await aws_bedrock.listAgents({});

    const existingAgent = agentSummaries.find((a) => a.agentName === agentName);

    if (existingAgent) {
      agentId = existingAgent.agentId;

      await aws_bedrock.updateAgent({
        agentId,
        agentName,
        instruction: prompts.agentInstruction,
        agentResourceRoleArn: agentRoleArn,
        idleSessionTTLInSeconds: agentConfig.sessionTimeout,
        foundationModel: agentConfig.foundationModel,
      });
    } else {
      const {
        agent: { agentId: newAgentId },
      } = await aws_bedrock.createAgent({
        agentName,
        instruction: prompts.agentInstruction,
        agentResourceRoleArn: agentRoleArn,
        idleSessionTTLInSeconds: agentConfig.sessionTimeout,
        foundationModel: agentConfig.foundationModel,
      });

      agentId = newAgentId;
    }

    await waitForAgent(agentId);
  }

  // ====================================================================================
  // Action group

  let actionGroupId: string;

  {
    const actionGroupName = `${prefix}-agent-api`;
    const lambdaArn = `arn:aws:lambda:${awsConfig.region}:${accountId}:function:${prefix}-${awsConfig.stage}-api:$LATEST`;

    const { actionGroupSummaries } = await aws_bedrock.listAgentActionGroups({ agentId, agentVersion: 'DRAFT' });
    const existingActionGroup = actionGroupSummaries.find((a) => a.actionGroupName === actionGroupName);

    if (existingActionGroup) {
      actionGroupId = existingActionGroup.actionGroupId;

      await aws_bedrock.updateAgentActionGroup({
        agentId,
        actionGroupId,
        agentVersion: 'DRAFT',
        actionGroupName: actionGroupName,
        actionGroupState: 'ENABLED',
        actionGroupExecutor: {
          lambda: lambdaArn,
        },
        apiSchema: {
          payload: JSON.stringify(agentApiSpec, undefined, '  '),
        },
      });
    } else {
      const {
        agentActionGroup: { actionGroupId: newActionGroupId },
      } = await aws_bedrock.createAgentActionGroup({
        agentId,
        agentVersion: 'DRAFT',
        actionGroupName: actionGroupName,
        actionGroupState: 'ENABLED',
        actionGroupExecutor: {
          lambda: lambdaArn,
        },
        apiSchema: {
          payload: JSON.stringify(agentApiSpec, undefined, '  '),
        },
      });

      actionGroupId = newActionGroupId;
    }
  }

  // ====================================================================================
  // Agent alias

  await aws_bedrock.prepareAgent({
    agentId,
  });

  await waitForAgent(agentId);

  let agentAliasId: string;

  {
    const agentAliasName = 'Production';

    const { agentAliasSummaries } = await aws_bedrock.listAgentAliases({
      agentId,
    });

    const existingAgentAlias = agentAliasSummaries.find((a) => a.agentAliasName === agentAliasName);

    if (existingAgentAlias) {
      agentAliasId = existingAgentAlias.agentAliasId;

      await aws_bedrock.updateAgentAlias({
        agentId,
        agentAliasId,
        agentAliasName,
      });
    } else {
      const {
        agentAlias: { agentAliasId: newAgentAliasId },
      } = await aws_bedrock.createAgentAlias({
        agentId,
        agentAliasName,
      });

      agentAliasId = newAgentAliasId;
    }
  }

  return { agentId, agentRoleArn, actionGroupId, agentAliasId };
};

/**
 * Dispose deployed Bedrock resources.
 */
export const dispose = async () => {
  const { bedrockAgentId: agentId } = envConfig;

  await aws_bedrock.deleteAgent({ agentId, skipResourceInUseCheck: true });
};

/**
 * Wait for agent to finish updating.
 * @param agentId Agent ID.
 */
async function waitForAgent(agentId: string) {
  const {
    agent: { agentStatus },
  } = await aws_bedrock.getAgent({ agentId });

  let status = agentStatus;

  const waitStatuses: AgentStatus[] = [
    AgentStatus.CREATING,
    AgentStatus.PREPARING,
    AgentStatus.UPDATING,
    AgentStatus.VERSIONING,
  ];

  while (waitStatuses.includes(status)) {
    await new Promise((r) => setTimeout(r, 1000));

    const {
      agent: { agentStatus },
    } = await aws_bedrock.getAgent({ agentId });

    status = agentStatus;
  }
}
