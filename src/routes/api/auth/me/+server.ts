import { json } from '@sveltejs/kit';
import { getUserBySessionId } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        const sessionId = cookies.get('session_id');

        if (!sessionId) {
            return json({ user: null });
        }

        const user = await getUserBySessionId(sessionId);

        if (!user) {
            return json({ user: null });
        }

        return json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profilePictureUrl: user.profile_picture_url
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return json({ user: null });
    }
};
