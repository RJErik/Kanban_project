<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import { onMount } from 'svelte';

    // User state
    let user: { username: string; profilePictureUrl?: string } | null = null;
    let loading = true;

    onMount(async () => {
        try {
            const response = await fetch('/api/auth/me');

            if (response.ok) {
                const data = await response.json();
                user = data.user;
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            loading = false;
        }
    });
</script>

<div class="app">
    <Header {user} />

    <main>
        {#if loading}
            <div class="loading">Loading...</div>
        {:else}
            <slot />
        {/if}
    </main>

    <footer>
        <p>© {new Date().getFullYear()} Kanban Board - SvelteKit Project</p>
    </footer>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: #f9fafb;
        color: #111827;
    }

    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    main {
        flex: 1;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
    }

    footer {
        text-align: center;
        padding: 1.5rem;
        background-color: #f8f9fa;
        color: #6b7280;
        margin-top: auto;
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50vh;
        font-size: 1.2rem;
        color: #6b7280;
    }
</style>
