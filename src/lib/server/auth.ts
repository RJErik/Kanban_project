import { db } from './database';
import crypto from 'crypto';
import type { User, Session } from './database';
import type {Cookies} from "@sveltejs/kit";

export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser(
    username: string,
    email: string,
    password: string,
    profilePictureUrl?: string
): Promise<User> {
    const database = await db;
    const hashedPassword = hashPassword(password);

    const result = await database.run(
        'INSERT INTO users (username, email, password_hash, profile_picture_url) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, profilePictureUrl || null]
    );

    const userId = result.lastID;

    return {
        id: userId!,
        username,
        email,
        password_hash: hashedPassword,
        profile_picture_url: profilePictureUrl,
        created_at: new Date().toISOString()
    };
}

export async function getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const database = await db;
    return database.get<User>(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [identifier, identifier]
    );
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
    return hashPassword(password) === hashedPassword;
}

export async function createSession(userId: number): Promise<Session> {
    const database = await db;

    const sessionId = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await database.run(
        'INSERT INTO sessions ([id], user_id, expires_at) VALUES (?, ?, ?)',
        [sessionId, userId, expiresAt.toISOString()]
    );

    return {
        id: sessionId,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
    };
}

export async function getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const database = await db;
    return database.get<User>(
        `SELECT u.* FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')`,
        [sessionId]
    );
}

export async function deleteSession(sessionId: string): Promise<void> {
    const database = await db;
    await database.run('DELETE FROM sessions WHERE [id] = ?', [sessionId]);
}

export async function getAuthenticatedUser(cookies: Cookies): Promise<User | null> {
    const sessionId = cookies.get('session_id');

    if (!sessionId) {
        return null;
    }

    const user = await getUserBySessionId(sessionId);
    return user || null;
}