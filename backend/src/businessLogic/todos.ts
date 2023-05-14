import { v4 as uuidV4 } from 'uuid';
import {
    getTodosByUserId,
    createTodoItem,
    deleteTodoItem,
    updateTodoItem,
    updateTodoAttachmentUrl,
} from '../dataLayer/todosAcess';
import { getSignedUrl } from '../helpers/attachmentUtils';
import TodoItem from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('Todos');

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
    logger.info('getTodosForUser is processing');
    return await getTodosByUserId(userId);
};

export const createTodo = async (
    userId: string,
    todo: CreateTodoRequest
): Promise<TodoItem> => {
    logger.info(`createTodo is processing - userId: ${userId}`);

    const todoId = uuidV4();
    const createdAt = new Date().toISOString();
    const done = false;

    return await createTodoItem({
        userId,
        todoId,
        createdAt,
        done,
        ...todo,
    });
};

export const updateTodo = async (
    userId: string,
    todoId: string,
    updatedTodo: UpdateTodoRequest
): Promise<TodoItem> => {
    logger.info(
        `updateTodo is processing - userId: ${userId} - todoId: ${todoId}`
    );
    return await updateTodoItem(userId, todoId, updatedTodo);
};

export const deleteTodo = async (
    userId: string,
    todoId: string
): Promise<void> => {
    logger.info(
        `deleteTodo is processing - userId: ${userId} - todoId: ${todoId}`
    );
    await deleteTodoItem(userId, todoId);
};

export const createAttachmentPresignedUrl = async (
    todoId: string,
    userId: string
): Promise<string> => {
    await updateTodoAttachmentUrl(todoId, userId);

    return getSignedUrl(todoId);
};
