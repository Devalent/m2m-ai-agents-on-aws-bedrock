import type { AWS } from '@serverless/typescript';
import { handlerPath } from '@libs/handler-resolver';
import schema from './schema';

export default <AWS['functions']['']>{
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'question',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
