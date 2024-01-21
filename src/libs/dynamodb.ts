import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { region } from '@config/aws';

const client = new DynamoDBClient({ region });
const dynamodb = DynamoDBDocument.from(client);

export const putDocument = async (table: string, document: any) => {
  await dynamodb.put({
    TableName: table,
    Item: document,
  });
};

export const readDocument = async (table: string, id: string) => {
  const { Item } = await dynamodb.get({
    TableName: table,
    Key: { id },
  });

  return Item;
};
