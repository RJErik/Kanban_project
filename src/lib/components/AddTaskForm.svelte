<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { BoardColumn } from '$lib/server/database';

    export let columns: BoardColumn[] = [];

    let title = '';
    let description = '';
    let selectedColumnId: number | null = null;
    let error = '';
    let loading = false;
    let isFormOpen = false;

    const dispatch = createEventDispatcher();

    $: if (columns.length > 0 && !selectedColumnId) {
        selectedColumnId = columns[0].id;
    }

    function openForm() {
        isFormOpen = true;
    }

    function closeForm() {
        isFormOpen = false;
        resetForm();
    }

    function resetForm() {
        title = '';
        description = '';
        error = '';
    }

    async function handleSubmit() {
        if (!title.trim()) {
            error = 'Task title is required';
            return;
        }

        if (!selectedColumnId) {
            error = 'Please select a column';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    columnId: selectedColumnId,
                    title,
                    description
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create task');
            }

            const data = await response.json();
            dispatch('taskCreated', data.task);
            closeForm();
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
</script>

{#if isFormOpen}
    <div class="add-task-form">
        <div class="form-header">
            <h3>Add New Task</h3>
            <button class="close-btn" on:click={closeForm}>×</button>
        </div>

        {#if error}
            <div class="error-message">{error}</div>
        {/if}

        <div class="form-group">
            <label for="title">Title *</label>
            <input
                    type="text"
                    id="title"
                    bind:value={title}
                    placeholder="Task title"
                    disabled={loading}
            />
        </div>

        <div class="form-group">
            <label for="description">Description</label>
            <textarea
                    id="description"
                    bind:value={description}
                    placeholder="Task description (optional)"
                    rows="3"
                    disabled={loading}
            ></textarea>
        </div>

        <div class="form-group">
            <label for="column">Column *</label>
            <select id="column" bind:value={selectedColumnId} disabled={loading}>
                {#each columns as column}
                    <option value={column.id}>{column.name}</option>
                {/each}
            </select>
        </div>

        <div class="form-actions">
            <button class="cancel-btn" on:click={closeForm} disabled={loading}>
                Cancel
            </button>
            <button class="submit-btn" on:click={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Add Task'}
            </button>
        </div>
    </div>
{:else}
    <button class="add-task-btn" on:click={openForm}>
        + Add New Task
    </button>
{/if}

<style>
    .add-task-btn {
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .add-task-btn:hover {
        background-color: #2563eb;
    }

    .add-task-form {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 500px;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .form-header h3 {
        margin: 0;
        color: #334155;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
        padding: 0;
        line-height: 1;
    }

    .error-message {
        color: #ef4444;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 500;
        color: #475569;
        font-size: 0.875rem;
    }

    input, textarea, select {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .cancel-btn, .submit-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .cancel-btn {
        background-color: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
    }

    .cancel-btn:hover {
        background-color: #e2e8f0;
    }

    .submit-btn {
        background-color: #3b82f6;
        color: white;
        border: none;
    }

    .submit-btn:hover {
        background-color: #2563eb;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
