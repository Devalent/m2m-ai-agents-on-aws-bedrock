const { BEDROCK_AGENT_ID, BEDROCK_ACTION_GROUP_ID, BEDROCK_AGENT_ALIAS_ID, TABLE_ANSWERS } = process.env;

if (!BEDROCK_AGENT_ID) {
  throw `BEDROCK_AGENT_ID is not provided`;
}

if (!BEDROCK_ACTION_GROUP_ID) {
  throw `BEDROCK_ACTION_GROUP_ID is not provided`;
}

if (!BEDROCK_AGENT_ALIAS_ID) {
  throw `BEDROCK_AGENT_ALIAS_ID is not provided`;
}

/**
 * Bedrock agent ID.
 */
export const bedrockAgentId = BEDROCK_AGENT_ID;

/**
 * Bedrock agent API action group ID.
 */
export const bedrockActionGroupId = BEDROCK_ACTION_GROUP_ID;

/**
 * Bedrock agent version alias ID.
 */
export const bedrockAgentAliasId = BEDROCK_AGENT_ALIAS_ID;

/**
 * DynamoDB table name for agent answers.
 */
export const answersTable = TABLE_ANSWERS;
