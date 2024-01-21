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

export const bedrockAgentId = BEDROCK_AGENT_ID;

export const bedrockActionGroupId = BEDROCK_ACTION_GROUP_ID;

export const bedrockAgentAliasId = BEDROCK_AGENT_ALIAS_ID;

export const answersTable = TABLE_ANSWERS;
