import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';
import type { Member } from '$lib/server/database';

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

        const rawMembers = await database.all(`
            SELECT u.id, u.username, u.profile_picture_url, pm.joined_at
            FROM users u
                     JOIN project_members pm ON u.id = pm.user_id
            WHERE pm.project_id = ?
            ORDER BY pm.joined_at ASC
        `, [projectId]);

        const members: Member[] = rawMembers.map(member => ({
            id: member.id,
            username: member.username,
            profilePictureUrl: member.profile_picture_url ||
                `https://picsum.photos/seed/user${member.id}/200`,
            joinedAt: member.joined_at
        }));

        return json({ members });
    } catch (error) {
        console.error('Failed to fetch project members:', error);
        return json({ error: 'Failed to fetch project members' }, { status: 500 });
    }
};
