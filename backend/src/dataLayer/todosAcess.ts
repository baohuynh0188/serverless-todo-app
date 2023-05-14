import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import TodoItem from '../models/TodoItem';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

const createDynamoDBClient = () => {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
};

const docClient: DocumentClient = createDynamoDBClient();
const todosTable = process.env.TODOS_TABLE;
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;

export const getTodosByUserId = async (userId: string): Promise<TodoItem[]> => {
    logger.info('Getting all todos');

    const params = {
        TableName: todosTable,
        IndexName: todosCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    const result = await docClient.query(params).promise();

    return result.Items as TodoItem[];
};

export const createTodoItem = async (item: object | any): Promise<TodoItem> => {
    logger.info('Creating Todo');
    const params = {
        TableName: todosTable,
        Item: item
    };

    await docClient.put(params).promise();

    logger.info(`Creating Todo: ${{ item }}`);

    return item;
};

export const deleteTodoItem = async (userId: string, todoId: string) => {
    logger.info(`Deleting Todo: ${todoId}`);

    const params = {
        TableName: todosTable,
        Key: {
            userId,
            todoId
        }
    };

    await docClient.delete(params).promise();
    logger.info('Todo is deleted!');
};

const todosAccess = {
    getTodosByUserId,
    createTodoItem,
    deleteTodoItem
};

export default todosAccess;
