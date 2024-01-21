import { agentApiSpec } from '@resources/openapi';
import { FromSchema } from 'json-schema-to-ts';

const inputSchema = agentApiSpec.paths['/answer-question'].post.requestBody.content['application/json'].schema;
export type AnswerQuestionInput = FromSchema<typeof inputSchema>;

export type QuestionAnswerDocument = {
  id: string;
  answer: string;
};
