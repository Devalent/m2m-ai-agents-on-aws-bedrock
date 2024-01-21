import type { TypedLambdaEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { Router } from '@libs/router';
import { AgentRequest, AgentResponse, createAgentResponse, getAgentInput } from '@libs/bedrock';
import { answersTable } from '@config/env';
import { putDocument } from '@libs/dynamodb';
import { AnswerQuestionInput, QuestionAnswerDocument } from './schema';

const router = new Router();

const api: TypedLambdaEvent<AgentRequest, AgentResponse> = async (event) => {
  return await router.handle(event.httpMethod, event.apiPath, event);
};

router.add('POST', '/answer-question', async (request: AgentRequest) => {
  const input = getAgentInput<AnswerQuestionInput>(request); // Parse the request body

  const document: QuestionAnswerDocument = { id: request.sessionId, answer: input.answer };

  await putDocument(answersTable, document); // Save the answer to DB

  return createAgentResponse(request, { status: 'OK' });
});

export const main = middyfy(api);
