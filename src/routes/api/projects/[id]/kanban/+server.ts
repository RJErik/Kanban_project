import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, params }) => {
    const user = await getAuthenticatedUser(cookies);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    if (!projectId || isNaN(Number(projectId))) {
        return json({ error: 'Invalid project ID' }, { status: 400 });
    }

    try {
        const database = await db;

        const membership = await database.get(`
            SELECT * FROM project_members 
            WHERE project_id = ? AND user_id = ?
        `, [projectId, user.id]);

        if (!membership) {
            return json({ error: 'You are not a member of this project' }, { status: 403 });
        }

        const columns = await database.all(`
            SELECT * FROM board_columns
            WHERE project_id = ?
            ORDER BY position ASC
        `, [projectId]);

        for (const column of columns) {
            const tasks = await database.all(`
                SELECT t.*, u.username as creator_name
                FROM tasks t
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.column_id = ?
                ORDER BY t.position ASC
            `, [column.id]);

            column.tasks = tasks;
        }

        return json({ columns });
    } catch (error) {
        console.error('Failed to fetch kanban data:', error);
        return json({ error: 'Failed to fetch kanban data' }, { status: 500 });
    }
};
