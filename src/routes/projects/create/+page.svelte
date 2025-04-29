<script lang="ts">
    import { goto } from '$app/navigation';

    let name = '';
    let description = '';
    let error = '';
    let loading = false;

    async function createProject() {
        if (!name.trim()) {
            error = 'Project name is required';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create project');
            }

            await goto('/projects');
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

<svelte:head>
    <title>Create Project - Kanban Board</title>
</svelte:head>

<div class="create-project-page">
    <div class="form-container">
        <h1>Create New Project</h1>

        {#if error}
            <div class="error-message">{error}</div>
        {/if}

        <div class="form-group">
            <label for="name">Project Name *</label>
            <input
                    type="text"
                    id="name"
                    bind:value={name}
                    placeholder="Enter project name"
                    disabled={loading}
            />
        </div>

        <div class="form-group">
            <label for="description">Description</label>
            <textarea
                    id="description"
                    bind:value={description}
                    placeholder="Project description (optional)"
                    rows="4"
                    disabled={loading}
            ></textarea>
        </div>

        <div class="form-actions">
            <a href="/projects" class="cancel-btn">Cancel</a>
            <button class="create-btn" on:click={createProject} disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
            </button>
        </div>
    </div>
</div>

<style>
    .create-project-page {
        display: flex;
        justify-content: center;
        padding: 2rem 1rem;
    }

    .form-container {
        background-color: white;
        border-radius: 0.5rem;
        padding: 2rem;
        width: 100%;
        max-width: 600px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h1 {
        color: #334155;
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
    }

    .error-message {
        background-color: #fecaca;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #475569;
    }

    input, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        font-size: 1rem;
        font-family: inherit;
    }

    input:focus, textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }

    .cancel-btn, .create-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .cancel-btn {
        background-color: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
    }

    .cancel-btn:hover {
        background-color: #e2e8f0;
    }

    .create-btn {
        background-color: #3b82f6;
        color: white;
        border: none;
    }

    .create-btn:hover {
        background-color: #2563eb;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
