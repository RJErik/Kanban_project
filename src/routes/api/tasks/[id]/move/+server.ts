import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ cookies, params, request }) => {
    const user = await getAuthenticatedUser(cookies);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;

    if (!taskId || isNaN(Number(taskId))) {
        return json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const { columnId, position } = await request.json();

        if (!columnId || isNaN(Number(columnId))) {
            return json({ error: 'Invalid column ID' }, { status: 400 });
        }

        const database = await db;

        const task = await database.get(`
            SELECT t.*, bc.project_id 
            FROM tasks t
            JOIN board_columns bc ON t.column_id = bc.id
            WHERE t.id = ?
        `, [taskId]);

        if (!task) {
            return json({ error: 'Task not found' }, { status: 404 });
        }

        const membership = await database.get(`
            SELECT * FROM project_members 
            WHERE project_id = ? AND user_id = ?
        `, [task.project_id, user.id]);

        if (!membership) {
            return json({ error: 'You are not a member of this project' }, { status: 403 });
        }

        const targetColumn = await database.get(`
            SELECT * FROM board_columns
            WHERE id = ? AND project_id = ?
        `, [columnId, task.project_id]);

        if (!targetColumn) {
            return json({ error: 'Invalid target column' }, { status: 400 });
        }

        let finalPosition = position;

        if (finalPosition === undefined) {
            const positionResult = await database.get(`
                SELECT COALESCE(MAX(position), -1) + 1 as next_position
                FROM tasks
                WHERE column_id = ?
            `, [columnId]);

            finalPosition = positionResult.next_position || 0;
        }

        await database.run(`
            UPDATE tasks
            SET column_id = ?, position = ?
            WHERE id = ?
        `, [columnId, finalPosition, taskId]);

        const updatedTask = await database.get(`
            SELECT t.*, u.username as creator_name
            FROM tasks t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.id = ?
        `, [taskId]);

        return json({ task: updatedTask });
    } catch (error) {
        console.error('Failed to move task:', error);
        return json({ error: 'Failed to move task' }, { status: 500 });
    }
};
