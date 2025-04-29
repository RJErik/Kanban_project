<script lang="ts">
    import { onMount } from 'svelte';

    export let projectId: number | null = null;

    type Member = {
        id: number;
        username: string;
        profilePictureUrl: string;
        joinedAt: string;
    };

    let members: Member[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        if (projectId) {
            await loadMembers();
        } else {
            loading = false;
        }
    });

    $: if (projectId) {
        loadMembers();
    }

    async function loadMembers() {
        if (!projectId) return;

        loading = true;
        error = null;

        try {
            const response = await fetch(`/api/projects/${projectId}/members`);

            if (!response.ok) {
                throw new Error('Failed to load project members');
            }

            const data = await response.json();
            members = data.members;
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unexpected error occurred';
            }
        } finally {
            loading = false;
        }
    }

    function formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return 'Date unavailable';
            }

            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Date unavailable';
        }
    }
</script>

<div class="member-list">
    {#if loading}
        <div class="loading">Loading members...</div>
    {:else if error}
        <div class="error">
            <p>{error}</p>
            <button on:click={loadMembers}>Try Again</button>
        </div>
    {:else if !projectId}
        <div class="no-project">
            <p>Select a project from the sidebar to view its members.</p>
        </div>
    {:else if members.length === 0}
        <div class="empty-list">
            <p>This project doesn't have any members yet.</p>
        </div>
    {:else}
        <h2>Project Members</h2>
        <div class="members-grid">
            {#each members as member}
                <div class="member-card">
                    <div class="member-avatar">
                        <img src={member.profilePictureUrl} alt={member.username} />
                    </div>
                    <div class="member-info">
                        <div class="member-name">{member.username}</div>
                        <div class="member-joined">
                            Joined {formatDate(member.joinedAt)}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .member-list {
        padding: 1rem;
        height: 100%;
    }

    h2 {
        color: #334155;
        margin-top: 0;
        margin-bottom: 1.5rem;
    }

    .loading, .error, .no-project, .empty-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #64748b;
    }

    .error {
        color: #ef4444;
    }

    .error button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .members-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .member-card {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1rem;
        display: flex;
        align-items: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .member-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 1rem;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .member-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .member-info {
        flex: 1;
    }

    .member-name {
        font-weight: 500;
        color: #334155;
        margin-bottom: 0.25rem;
    }

    .member-joined {
        font-size: 0.875rem;
        color: #64748b;
    }
</style>
