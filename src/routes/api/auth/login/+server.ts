import { json } from '@sveltejs/kit';
import { getUserByIdentifier, verifyPassword, createSession } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { identifier, password } = data;

        if (!identifier || !password) {
            return json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await getUserByIdentifier(identifier);

        if (!user || !verifyPassword(password, user.password_hash)) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

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
        console.error('Login error:', error);
        return json({ error: 'Login failed' }, { status: 500 });
    }
};
