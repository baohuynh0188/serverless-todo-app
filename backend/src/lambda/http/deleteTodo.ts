import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { deleteTodo } from '../../businessLogic/todos';
import { getUserId } from '../utils';

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const userId = getUserId(event);
        const todoId = event.pathParameters.todoId;

        try {
            await deleteTodo(userId, todoId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Todo ${todoId} has been deleted`,
                }),
            };
        } catch (error) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: `Can not delete todo: ${todoId}`,
                    error,
                }),
            };
        }
    }
);

handler.use(httpErrorHandler()).use(cors({ credentials: true }));
