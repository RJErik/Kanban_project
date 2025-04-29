import * as fs from 'fs';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
}

let exists = fs.existsSync('./tmp/kanban.db');

export const db: Promise<Database> = open({
    filename: './tmp/kanban.db',
    driver: sqlite3.Database
});

async function initializeDatabase(): Promise<void> {
    const database = await db;

    if (!exists) {
        await database.exec(`
            -- Users Table
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                profile_picture_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Sessions Table for authentication
            CREATE TABLE sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            -- Projects Table
            CREATE TABLE projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                invite_code TEXT NOT NULL UNIQUE,
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );

            -- Project_Members Table (many-to-many relationship)
            CREATE TABLE project_members (
                project_id INTEGER,
                user_id INTEGER,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (project_id, user_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            -- Board Columns Table
            CREATE TABLE board_columns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                name TEXT NOT NULL CHECK (name IN ('To Do', 'In Progress', 'Done')),
                position INTEGER NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            -- Tasks Table
            CREATE TABLE tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                column_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                created_by INTEGER,
                position INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (column_id) REFERENCES board_columns(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );
        `);

        await database.exec(`
            CREATE TRIGGER create_default_columns AFTER INSERT ON projects
            BEGIN
                INSERT INTO board_columns (project_id, name, position) VALUES 
                    (NEW.id, 'To Do', 0),
                    (NEW.id, 'In Progress', 1),
                    (NEW.id, 'Done', 2);
            END;
        `);

        await database.exec(`
            CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
        `);

        await database.exec(`
            CREATE INDEX idx_sessions_user_id ON sessions(user_id);
        `);
    }
}

initializeDatabase().catch(err => {
    console.error('Database initialization failed:', err);
});

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    profile_picture_url?: string;
    created_at: string;
}

export interface Session {
    id: string;
    user_id: number;
    expires_at: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    invite_code: string;
    created_by: number;
    created_at: string;
}

export interface Member {
    id: number;
    username: string;
    profilePictureUrl: string;
    joinedAt: string;
}

export interface BoardColumn {
    id: number;
    project_id: number;
    name: 'To Do' | 'In Progress' | 'Done';
    position: number;
}

export interface Task {
    id: number;
    column_id: number;
    title: string;
    description?: string;
    created_by: number;
    position: number;
    created_at: string;
}