<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Project } from '$lib/server/database';

    export let projects: Project[] = [];
    export let activeProjectId: number | null = null;

    const dispatch = createEventDispatcher();

    function selectProject(projectId: number) {
        dispatch('selectProject', projectId);
    }

    function leaveProject(projectId: number) {
        dispatch('leaveProject', projectId);
    }

    function openJoinModal() {
        dispatch('openJoinModal');
    }
</script>

<div class="project-sidebar">
    <div class="sidebar-header">
        <h2>Your Projects</h2>
        <button class="join-btn" on:click={openJoinModal}>
            Join Project
        </button>
    </div>

    <div class="project-list">
        {#if projects.length === 0}
            <div class="no-projects">
                <p>You don't have any projects yet.</p>
            </div>
        {:else}
            {#each projects as project}
                <div
                        class="project-item"
                        class:active={activeProjectId === project.id}
                        on:click={() => selectProject(project.id)}
                        on:keydown={(e) => e.key === 'Enter' && selectProject(project.id)}
                        tabindex="0"
                        role="button"
                        aria-pressed={activeProjectId === project.id}
                >
                    <div class="project-info">
                        <span class="project-name">{project.name}</span>
                    </div>
                    <button
                            class="leave-btn"
                            on:click|stopPropagation={() => leaveProject(project.id)}
                            title="Leave Project"
                    >
                        ×
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .project-sidebar {
        background-color: #f8fafc;
        border-right: 1px solid #e2e8f0;
        height: 100%;
        width: 200px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .sidebar-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #334155;
    }

    .join-btn {
        padding: 0.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .join-btn:hover {
        background-color: #2563eb;
    }

    .project-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
    }

    .project-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        border-radius: 0.25rem;
        margin-bottom: 0.25rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .project-item:hover {
        background-color: #e2e8f0;
    }

    .project-item.active {
        background-color: #dbeafe;
        border-left: 3px solid #3b82f6;
    }

    .project-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .project-name {
        font-weight: 500;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .leave-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        line-height: 1;
        height: 24px;
        width: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: all 0.2s;
    }

    .leave-btn:hover {
        background-color: #f87171;
        color: white;
        opacity: 1;
    }

    .no-projects {
        padding: 1rem;
        color: #64748b;
        text-align: center;
    }
</style>
