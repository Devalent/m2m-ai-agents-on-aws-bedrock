import { BedrockAgentRuntime } from '@aws-sdk/client-bedrock-agent-runtime';
import { useTracing } from '@config/agent';
import { region } from '@config/aws';
import { bedrockAgentId, bedrockAgentAliasId } from '@config/env';
import { HttpMethod } from '@libs/api-gateway';
import { agentApiSpec } from '@resources/openapi';
import { TextDecoder } from 'util';
import * as uuid from 'uuid';

const bedrock = new BedrockAgentRuntime({ region });

export const invokeAgent = async (inputText: string) => {
  const sessionId = uuid.v4();

  const { completion } = await bedrock.invokeAgent({
    inputText,
    sessionId,
    agentId: bedrockAgentId,
    agentAliasId: bedrockAgentAliasId,
    enableTrace: useTracing,
  });

  return { completion, sessionId };
};

export const decodeResponse = (chunks: Uint8Array[]) => {
  const response = new Uint8Array(
    chunks.reduce((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []),
  );

  return new TextDecoder().decode(response);
};

export type AgentRequest = {
  messageVersion: '1.0';
  agent: {
    name: string;
    id: string;
    alias: string;
    version: string;
  };
  inputText: string;
  sessionId: string;
  actionGroup: string;
  apiPath: keyof typeof agentApiSpec.paths;
  httpMethod: HttpMethod;
  parameters: {
    name: string;
    type: string;
    value: string;
  }[];
  requestBody: {
    content: {
      'application/json': {
        properties: {
          name: string;
          type: string;
          value: string;
        }[];
      };
    };
  };
  sessionAttributes: {
    [x: string]: string;
  };
  promptSessionAttributes: {
    [x: string]: string;
  };
};

export type AgentResponse = {
  messageVersion: '1.0';
  response: {
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    httpStatusCode: number;
    responseBody?: {
      [type: string]: {
        body: string;
      };
    };
    sessionAttributes: {
      [x: string]: string;
    };
    promptSessionAttributes: {
      [x: string]: string;
    };
  };
};

export const getAgentInput = <T = any>(request: AgentRequest): T | null => {
  return (
    request.requestBody?.content?.['application/json']?.properties?.reduce((res, prop) => {
      res[prop.name] = prop.value;
      return res;
    }, {} as any) || null
  );
};

export const createAgentResponse = (request: AgentRequest, body: any, statusCode = 200) => {
  const response: AgentResponse = {
    messageVersion: '1.0',
    response: {
      actionGroup: request.actionGroup,
      apiPath: request.apiPath,
      httpMethod: request.httpMethod,
      httpStatusCode: statusCode,
      promptSessionAttributes: request.promptSessionAttributes,
      sessionAttributes: request.sessionAttributes,
      responseBody: body
        ? {
            'application/json': {
              body: JSON.stringify(body),
            },
          }
        : undefined,
    },
  };

  return response;
};
