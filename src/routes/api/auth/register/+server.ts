import { json } from '@sveltejs/kit';
import { createUser, createSession } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { username, email, password, profilePictureUrl } = data;

        if (!username || !email || !password) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await createUser(username, email, password, profilePictureUrl);

        const session = await createSession(user.id);

        cookies.set('session_id', session.id, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profilePictureUrl: user.profile_picture_url
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return json({
            error: error instanceof Error ? error.message : 'Registration failed'
        }, { status: 500 });
    }
};
