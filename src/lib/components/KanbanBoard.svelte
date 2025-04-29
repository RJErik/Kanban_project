<script lang="ts">
    import { onMount } from 'svelte';
    import type { BoardColumn, Task } from '$lib/server/database';
    import AddTaskForm from './AddTaskForm.svelte';

    export let projectId: number | null = null;
    export let projectInviteCode: string | undefined = undefined;

    let columns: (BoardColumn & { tasks: Task[] })[] = [];
    let loading = true;
    let error: string | null = null;
    let copySuccess = false;

    onMount(async () => {
        if (projectId) {
            await loadProjectData();
        } else {
            loading = false;
        }
    });

    $: if (projectId) {
        loadProjectData();
    }

    async function loadProjectData() {
        if (!projectId) return;

        loading = true;
        error = null;

        try {
            const response = await fetch(`/api/projects/${projectId}/kanban`);

            if (!response.ok) {
                throw new Error('Failed to load project data');
            }

            const data = await response.json();
            columns = data.columns;
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

    function handleTaskCreated() {
        loadProjectData();
    }

    async function copyInviteCode() {
        if (!projectInviteCode) return;

        try {
            await navigator.clipboard.writeText(projectInviteCode);
            copySuccess = true;
            setTimeout(() => copySuccess = false, 3000);
        } catch (err) {
            console.error('Failed to copy invite code:', err);
        }
    }

    let draggedTask: Task | null = null;
    let draggedColumn: number | null = null;

    function onDragStart(task: Task, columnId: number) {
        draggedTask = task;
        draggedColumn = columnId;
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    async function onDrop(event: DragEvent, columnId: number) {
        event.preventDefault();

        if (!draggedTask || draggedColumn === null || !projectId) return;

        if (draggedColumn === columnId) return;

        try {
            const response = await fetch(`/api/tasks/${draggedTask.id}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    columnId,
                    position: 0
                })
            });

            if (!response.ok) {
                throw new Error('Failed to move task');
            }

            await loadProjectData();
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unexpected error occurred';
            }
        }
    }
</script>

<div class="kanban-board">
    {#if loading}
        <div class="loading">Loading project data...</div>
    {:else if error}
        <div class="error">
            <p>{error}</p>
            <button on:click={loadProjectData}>Try Again</button>
        </div>
    {:else if !projectId}
        <div class="no-project">
            <p>Select a project from the sidebar to view its kanban board.</p>
        </div>
    {:else if columns.length === 0}
        <div class="empty-board">
            <p>This project doesn't have any columns yet.</p>
        </div>
    {:else}
        <div class="board-controls">
            <div class="control-row">
                <AddTaskForm
                        columns={columns}
                        on:taskCreated={handleTaskCreated}
                />

                {#if projectInviteCode}
                    <div class="invite-code-container">
                        <span class="invite-label">Invite Code:</span>
                        <code class="invite-code">{projectInviteCode}</code>
                        <button
                                class="copy-btn"
                                on:click={copyInviteCode}
                                title="Copy invite code to clipboard"
                        >
                            {copySuccess ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                {/if}
            </div>
        </div>

        <div class="columns-container">
            {#each columns as column}
                <div
                        class="column"
                        on:dragover={(e) => onDragOver(e)}
                        on:drop={(e) => onDrop(e, column.id)}
                        role="region"
                        aria-label={`${column.name} column`}
                >
                    <div class="column-header">
                        <h3>{column.name}</h3>
                        <span class="task-count">{column.tasks.length}</span>
                    </div>

                    <div class="tasks">
                        {#if column.tasks.length === 0}
                            <div class="empty-column">No tasks</div>
                        {:else}
                            {#each column.tasks as task}
                                <div
                                        class="task"
                                        draggable="true"
                                        on:dragstart={() => onDragStart(task, column.id)}
                                        role="listitem"
                                        aria-label={`Task: ${task.title}`}
                                >
                                    <div class="task-title">{task.title}</div>
                                    {#if task.description}
                                        <div class="task-description">{task.description}</div>
                                    {/if}
                                    {#if task.created_by}
                                        <div class="task-creator">Added by {task.created_by}</div>
                                    {/if}
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .kanban-board {
        height: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .loading, .error, .no-project, .empty-board {
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

    .board-controls {
        margin-bottom: 1rem;
    }

    .control-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .invite-code-container {
        display: flex;
        align-items: center;
        background-color: #f8fafc;
        padding: 0.5rem;
        border-radius: 0.25rem;
        border: 1px solid #e2e8f0;
    }

    .invite-label {
        margin-right: 0.5rem;
        font-weight: 500;
        color: #64748b;
    }

    .invite-code {
        font-family: monospace;
        background-color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        color: #334155;
        margin-right: 0.5rem;
    }

    .copy-btn {
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.75rem;
        transition: background-color 0.2s;
    }

    .copy-btn:hover {
        background-color: #2563eb;
    }

    .columns-container {
        display: flex;
        gap: 1rem;
        height: 100%;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .column {
        background-color: #f1f5f9;
        border-radius: 0.5rem;
        width: 300px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        max-height: 100%;
    }

    .column-header {
        padding: 1rem;
        background-color: #e2e8f0;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .column-header h3 {
        margin: 0;
        font-size: 1rem;
        color: #334155;
    }

    .task-count {
        background-color: #cbd5e1;
        color: #334155;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .tasks {
        padding: 0.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .task {
        background-color: white;
        border-radius: 0.375rem;
        padding: 1rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: grab;
        transition: box-shadow 0.2s;
    }

    .task:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .task-title {
        font-weight: 500;
        color: #334155;
        margin-bottom: 0.5rem;
    }

    .task-description {
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.5rem;
    }

    .task-creator {
        font-size: 0.75rem;
        color: #94a3b8;
        padding-top: 0.5rem;
        border-top: 1px solid #f1f5f9;
    }

    .empty-column {
        padding: 1rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.875rem;
    }
</style>
