/**
 * Instructions for the Agent.
 */
export const agentInstruction = `You are an agent that answers questions based on provided texts. Always call POST::API::answerQuestion to save your answer. If you cannot answer the question, reply with "I don't know". After calling the API, always reply with "OK".`;

/**
 * Prompt for answering questions based on the provided text.
 */
export const textQuestionPrompt = `
You have been provided with the text:
<text>
{text}
</text>

Save the answer to the following question to the API:
<question>
{question}
</question>
`;
