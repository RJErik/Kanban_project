import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const GET: RequestHandler = async ({ cookies }) => {
    const user = await getAuthenticatedUser(cookies);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const database = await db;

        const projects = await database.all(`
            SELECT p.* 
            FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = ?
            ORDER BY p.created_at DESC
        `, [user.id]);

        return json({ projects });
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ cookies, request }) => {
    const user = await getAuthenticatedUser(cookies);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, description } = await request.json();

        if (!name || name.trim() === '') {
            return json({ error: 'Project name is required' }, { status: 400 });
        }

        const database = await db;

        const inviteCode = randomBytes(6).toString('hex');

        const result = await database.run(`
            INSERT INTO projects (name, description, invite_code, created_by)
            VALUES (?, ?, ?, ?)
        `, [name.trim(), description?.trim() || null, inviteCode, user.id]);

        const projectId = result.lastID;

        await database.run(`
            INSERT INTO project_members (project_id, user_id)
            VALUES (?, ?)
        `, [projectId, user.id]);

        const project = await database.get(`
            SELECT * FROM projects WHERE id = ?
        `, [projectId]);

        return json({ project });
    } catch (error) {
        console.error('Failed to create project:', error);
        return json({ error: 'Failed to create project' }, { status: 500 });
    }
};
