export default {
  type: 'object',
  properties: {
    text: { type: 'string' },
    question: { type: 'string' },
  },
  required: ['text', 'question'],
} as const;
