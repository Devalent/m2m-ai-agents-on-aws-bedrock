export default {
  type: 'object',
  properties: {
    question: { type: 'string' },
  },
  required: ['question'],
} as const;
