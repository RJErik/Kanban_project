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
        const { inviteCode } = await request.json();

        if (!inviteCode || inviteCode.trim() === '') {
            return json({ error: 'Invite code is required' }, { status: 400 });
        }

        const database = await db;

        const project = await database.get(`
            SELECT * FROM projects WHERE invite_code = ?
        `, [inviteCode.trim()]);

        if (!project) {
            return json({ error: 'Invalid invite code' }, { status: 404 });
        }

        const membership = await database.get(`
            SELECT * FROM project_members 
            WHERE project_id = ? AND user_id = ?
        `, [project.id, user.id]);

        if (membership) {
            return json({ error: 'You are already a member of this project' }, { status: 400 });
        }

        await database.run(`
            INSERT INTO project_members (project_id, user_id)
            VALUES (?, ?)
        `, [project.id, user.id]);

        return json({ project });
    } catch (error) {
        console.error('Failed to join project:', error);
        return json({ error: 'Failed to join project' }, { status: 500 });
    }
};
