import { textQuestionPrompt } from '@resources/prompts';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { invokeAgent } from '@libs/bedrock';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { readDocument } from '@libs/dynamodb';
import { answersTable } from '@config/env';

const api: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const inputText = textQuestionPrompt // Put text into the prompt template
    .replace('{text}', event.body.text)
    .replace('{question}', event.body.question);

  const { completion, sessionId } = await invokeAgent(inputText); // Call Bedrock agent with the text

  for await (const response of completion) {
    if (response.trace?.trace) {
      // Output trace info from the agent
      console.log(JSON.stringify(response.trace.trace));
    }
  }

  const document = await readDocument(answersTable, sessionId); // Read the saved answer

  return formatJSONResponse(document);
};

export const main = middyfy(api);
