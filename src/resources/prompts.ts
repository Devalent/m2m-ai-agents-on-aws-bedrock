/**
 * Instructions for the Agent.
 */
export const agentInstruction = `You are an agent that answers questions. You must save the answer to POST::API::answerQuestion API and reply with the response from the API.`;

/**
 * Prompt for answering questions.
 */
export const textQuestionPrompt = `Save the answer the following question: <question>{question}</question>`;
