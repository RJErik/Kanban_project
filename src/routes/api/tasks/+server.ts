import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
    const user = await getAuthenticatedUser(cookies);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { columnId, title, description } = await request.json();

        if (!columnId || isNaN(Number(columnId))) {
            return json({ error: 'Invalid column ID' }, { status: 400 });
        }

        if (!title || title.trim() === '') {
            return json({ error: 'Task title is required' }, { status: 400 });
        }

        const database = await db;

        const column = await database.get(`
            SELECT bc.* FROM board_columns bc
            WHERE bc.id = ?
        `, [columnId]);

        if (!column) {
            return json({ error: 'Column not found' }, { status: 404 });
        }

        const membership = await database.get(`
            SELECT * FROM project_members 
            WHERE project_id = ? AND user_id = ?
        `, [column.project_id, user.id]);

        if (!membership) {
            return json({ error: 'You are not a member of this project' }, { status: 403 });
        }

        const positionResult = await database.get(`
            SELECT COALESCE(MAX(position), -1) + 1 as next_position
            FROM tasks
            WHERE column_id = ?
        `, [columnId]);

        const position = positionResult.next_position || 0;

        const result = await database.run(`
            INSERT INTO tasks (column_id, title, description, created_by, position)
            VALUES (?, ?, ?, ?, ?)
        `, [columnId, title.trim(), description?.trim() || null, user.id, position]);

        const task = await database.get(`
            SELECT t.*, u.username as creator_name
            FROM tasks t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.id = ?
        `, [result.lastID]);

        return json({ task });
    } catch (error) {
        console.error('Failed to create task:', error);
        return json({ error: 'Failed to create task' }, { status: 500 });
    }
};
