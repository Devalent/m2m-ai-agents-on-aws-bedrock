/**
 * OpenAPI schema of the service available to AI agents.
 */
export const agentApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AI agent API',
    version: '1.0.0',
    description: 'APIs available for AI agents.',
  },
  paths: {
    '/answer-question': {
      post: {
        summary: 'API to save answers to questions',
        description: 'Answer a question about the provided text.',
        operationId: 'answerQuestion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answer'],
                properties: {
                  answer: {
                    type: 'string',
                    description: 'Answer to the question.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Answer saved successfully.' },
        },
      },
    },
  },
} as const;
