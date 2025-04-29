import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        const sessionId = cookies.get('session_id');

        if (sessionId) {
            await deleteSession(sessionId);
            cookies.delete('session_id', { path: '/' });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return json({ error: 'Logout failed' }, { status: 500 });
    }
};