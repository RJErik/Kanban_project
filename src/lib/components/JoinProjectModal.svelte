<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;

    const dispatch = createEventDispatcher();
    let inviteCode = '';
    let error = '';
    let loading = false;

    function closeModal() {
        dispatch('close');
        inviteCode = '';
        error = '';
    }

    async function joinProject() {
        if (!inviteCode.trim()) {
            error = 'Please enter an invite code';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/projects/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inviteCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join projects');
            }

            dispatch('projectJoined', data.project);
            closeModal();
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

{#if isOpen}
    <div class="modal-backdrop" on:click={closeModal}>
        <div class="modal-container" on:click|stopPropagation>
            <div class="modal-header">
                <h2>Join Project</h2>
                <button class="close-btn" on:click={closeModal}>×</button>
            </div>

            <div class="modal-body">
                <p>Enter the project invite code to join:</p>

                {#if error}
                    <div class="error-message">{error}</div>
                {/if}

                <div class="input-group">
                    <input
                            type="text"
                            bind:value={inviteCode}
                            placeholder="Enter invite code"
                            disabled={loading}
                    />
                </div>
            </div>

            <div class="modal-footer">
                <button class="cancel-btn" on:click={closeModal} disabled={loading}>
                    Cancel
                </button>
                <button class="join-btn" on:click={joinProject} disabled={loading}>
                    {loading ? 'Joining...' : 'Join Project'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-container {
        background-color: white;
        border-radius: 0.5rem;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
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

    .modal-body {
        padding: 1rem;
    }

    .input-group {
        margin-top: 0.5rem;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .error-message {
        color: #ef4444;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .cancel-btn, .join-btn {
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

    .join-btn {
        background-color: #3b82f6;
        color: white;
        border: none;
    }

    .join-btn:hover {
        background-color: #2563eb;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
