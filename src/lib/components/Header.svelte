<script lang="ts">
    import { page } from '$app/stores';

    export let user: { username: string; profilePictureUrl?: string } | null = null;
</script>

<header>
    <div class="logo">
        <a href="/">Kanban Board</a>
    </div>

    <nav>
        <ul>
            {#if user}
                <li class="nav-item">
                <span class="user-info">
                    {#if user.profilePictureUrl}
                        <img src={user.profilePictureUrl} alt={user.username} class="avatar" />
                    {/if}
                    Welcome, {user.username}
                </span>
                </li>
                <li class="nav-item">
                    <a
                            href="/"
                            class:active={$page.url.pathname === '/'}
                            aria-disabled={$page.url.pathname === '/'}
                    >
                        Home
                    </a>
                </li>
                <li class="nav-item">
                    <a
                            href="/projects"
                            class:active={$page.url.pathname.startsWith('/projects')}
                            aria-disabled={$page.url.pathname === '/projects'}
                    >
                        Projects
                    </a>
                </li>
                <li class="nav-item">
                    <button on:click={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                }}>Logout</button>
                </li>
            {:else}
                <li class="nav-item">
                    <a
                            href="/"
                            class:active={$page.url.pathname === '/'}
                            aria-disabled={$page.url.pathname === '/'}
                    >
                        Home
                    </a>
                </li>
                <li class="nav-item">
                    <a
                            href="/login"
                            class:active={$page.url.pathname === '/login'}
                            aria-disabled={$page.url.pathname === '/login'}
                    >
                        Login
                    </a>
                </li>
                <li class="nav-item">
                    <a
                            href="/register"
                            class:active={$page.url.pathname === '/register'}
                            aria-disabled={$page.url.pathname === '/register'}
                    >
                        Register
                    </a>
                </li>
            {/if}
        </ul>
    </nav>
</header>

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #f8f9fa;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logo a {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3b82f6;
        text-decoration: none;
    }

    nav ul {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        align-items: center;
    }

    .nav-item {
        margin-left: 1rem;
        display: flex;
        align-items: center;
    }

    nav a, nav button, .user-info {
        text-decoration: none;
        color: #4b5563;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
    }

    nav a:hover, nav button:hover {
        background-color: #e5e7eb;
    }

    nav a.active {
        color: #3b82f6;
        background-color: #eff6ff;
    }

    nav a[aria-disabled="true"] {
        pointer-events: none;
        opacity: 0.7;
    }

    nav button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-family: inherit;
    }

    .user-info {
        display: flex;
        align-items: center;
    }

    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 0.5rem;
        object-fit: cover;
    }
</style>
