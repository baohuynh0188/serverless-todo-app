import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';
import { updateTodoItem } from '../../dataLayer/todosAcess';

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const todoId = event.pathParameters.todoId;
        const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
        const userId = getUserId(event);

        try {
            await updateTodoItem(userId, todoId, updatedTodo);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Todo ${todoId} has been updated`,
                }),
            };
        } catch (error) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: `Can not update todo: ${todoId}`,
                    error,
                }),
            };
        }
    }
);

handler.use(httpErrorHandler()).use(
    cors({
        credentials: true,
    })
);
