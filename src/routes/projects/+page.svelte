<script lang="ts">
    import { onMount } from 'svelte';
    import ProjectSidebar from '$lib/components/ProjectSidebar.svelte';
    import JoinProjectModal from '$lib/components/JoinProjectModal.svelte';
    import KanbanBoard from '$lib/components/KanbanBoard.svelte';
    import MemberList from '$lib/components/MemberList.svelte';
    import type { Project } from '$lib/server/database';

    let projects: Project[] = [];
    let selectedProjectId: number | null = null;
    let activeView: 'kanban' | 'members' = 'kanban';
    let showJoinModal = false;
    let loading = true;
    let error: string | null = null;
    let selectedProject: Project | null = null;

    onMount(async () => {
        await loadProjects();
    });

    async function loadProjects() {
        loading = true;
        error = null;

        try {
            const response = await fetch('/api/projects');

            if (!response.ok) {
                throw new Error('Failed to load projects');
            }

            const data = await response.json();
            projects = data.projects;

            if (projects.length > 0 && !selectedProjectId) {
                selectedProjectId = projects[0].id;
                selectedProject = projects[0];
            }
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

    function handleSelectProject(event: CustomEvent<number>) {
        selectedProjectId = event.detail;
        selectedProject = projects.find(p => p.id === selectedProjectId) || null;
    }

    async function handleLeaveProject(event: CustomEvent<number>) {
        const projectId = event.detail;

        if (!confirm('Are you sure you want to leave this project?')) {
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/leave`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to leave project');
            }

            projects = projects.filter(p => p.id !== projectId);

            if (selectedProjectId === projectId) {
                selectedProjectId = projects.length > 0 ? projects[0].id : null;
                selectedProject = projects.length > 0 ? projects[0] : null;
            }
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('An unexpected error occurred');
            }
        }
    }

    function handleProjectJoined(event: CustomEvent<Project>) {
        const newProject = event.detail;
        projects = [...projects, newProject];
        selectedProjectId = newProject.id;
        selectedProject = newProject;
    }
</script>

<svelte:head>
    <title>Projects - Kanban Board</title>
</svelte:head>

<div class="projects-page">
    {#if loading && projects.length === 0}
        <div class="loading-container">Loading projects...</div>
    {:else if error && projects.length === 0}
        <div class="error-container">
            <p>{error}</p>
            <button on:click={loadProjects}>Try Again</button>
        </div>
    {:else}
        <div class="projects-layout">
            <ProjectSidebar
                    {projects}
                    activeProjectId={selectedProjectId}
                    on:selectProject={handleSelectProject}
                    on:leaveProject={handleLeaveProject}
                    on:openJoinModal={() => showJoinModal = true}
            />

            <div class="content-area">
                {#if selectedProjectId}
                    <div class="view-selector">
                        <button
                                class:active={activeView === 'kanban'}
                                on:click={() => activeView = 'kanban'}
                        >
                            Kanban Board
                        </button>
                        <button
                                class:active={activeView === 'members'}
                                on:click={() => activeView = 'members'}
                        >
                            Project Members
                        </button>
                    </div>

                    <div class="view-container">
                        {#if activeView === 'kanban'}
                            <KanbanBoard projectId={selectedProjectId} projectInviteCode={selectedProject?.invite_code} />
                        {:else}
                            <MemberList projectId={selectedProjectId} />
                        {/if}
                    </div>
                {:else}
                    <div class="no-selection">
                        <p>Select a project from the sidebar or join a new project to get started.</p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<JoinProjectModal
        isOpen={showJoinModal}
        on:close={() => showJoinModal = false}
        on:projectJoined={handleProjectJoined}
/>

<style>
    .projects-page {
        height: calc(100vh - 130px);
    }

    .loading-container, .error-container, .no-selection {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        text-align: center;
        color: #64748b;
    }

    .error-container {
        color: #ef4444;
    }

    .error-container button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .projects-layout {
        display: flex;
        height: 100%;
        overflow: hidden;
    }

    .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-left: 1rem;
    }

    .view-selector {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
        background-color: #f8fafc;
    }

    .view-selector button {
        background: none;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 500;
        color: #64748b;
        transition: all 0.2s;
    }

    .view-selector button:hover {
        background-color: #e2e8f0;
        color: #334155;
    }

    .view-selector button.active {
        background-color: #3b82f6;
        color: white;
    }

    .view-container {
        flex: 1;
        overflow: hidden;
    }
</style>
