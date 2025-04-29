import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, params }) => {
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
            return json({ error: 'You are not a member of this project' }, { status: 404 });
        }

        const project = await database.get(`
            SELECT * FROM projects WHERE id = ?
        `, [projectId]);

        if (project.created_by === user.id) {
            return json({
                error: 'Project creator cannot leave the project. You must delete the project instead.'
            }, { status: 400 });
        }

        await database.run(`
            DELETE FROM project_members 
            WHERE project_id = ? AND user_id = ?
        `, [projectId, user.id]);

        return json({ success: true });
    } catch (error) {
        console.error('Failed to leave project:', error);
        return json({ error: 'Failed to leave project' }, { status: 500 });
    }
};
