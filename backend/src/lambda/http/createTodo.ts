import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos';

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const newTodo: CreateTodoRequest = JSON.parse(event.body);

        const userId = getUserId(event);

        try {
            const todo = await createTodo(userId, newTodo);

            return {
                statusCode: 201,
                body: JSON.stringify({
                    item: todo
                })
            };
        } catch (error) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Can not create todo',
                    error
                })
            };
        }
    }
);

handler.use(cors({ credentials: true }));
