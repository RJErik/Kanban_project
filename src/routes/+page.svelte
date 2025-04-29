<script lang="ts">
    import { onMount } from 'svelte';
    import JoinProjectModal from '../lib/components/JoinProjectModal.svelte';

    let user: { username: string; profilePictureUrl?: string } | null = null;
    let fetchingUser = true;
    let joinModalOpen = false;

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
            fetchingUser = false;
        }
    });

    function openJoinModal() {
        joinModalOpen = true;
    }

    function handleModalClose() {
        joinModalOpen = false;
    }

    function handleProjectJoined() {
        joinModalOpen = false;
        window.location.href = `/projects/`;
    }
</script>

<div class="landing-container">
    <h1>Kanban Project</h1>

    <div class="button-container">
        {#if fetchingUser}
            <div class="loading-buttons">Loading...</div>
        {:else if user}
            <a href="/projects/create" class="btn btn-primary">Create Project</a>
            <button on:click={openJoinModal} class="btn btn-secondary">Join Project</button>
        {:else}
            <a href="/login" class="btn btn-primary">Log In</a>
            <a href="/register" class="btn btn-secondary">Register</a>
        {/if}
    </div>

    <div class="features">
        <div class="feature">
            <h3>Create Projects</h3>
            <p>Create and manage multiple Kanban projects for your different workflows.</p>
        </div>

        <div class="feature">
            <h3>Collaborate</h3>
            <p>Invite team members to join your projects with easy-to-share access codes.</p>
        </div>

        <div class="feature">
            <h3>Track Progress</h3>
            <p>Use drag and drop functionality to move tasks between different stages.</p>
        </div>
    </div>

    <!-- Add the JoinProjectModal component -->
    <JoinProjectModal
            isOpen={joinModalOpen}
            on:close={handleModalClose}
            on:projectJoined={handleProjectJoined}
    />
</div>

<style>
    .landing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
    }

    h1 {
        color: #3b82f6;
        font-size: 3rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        margin-bottom: 3rem;
    }

    .loading-buttons {
        font-size: 0.9rem;
        color: #6b7280;
    }

    .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 500;
        text-decoration: none;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background-color: #2563eb;
    }

    .btn-secondary {
        background-color: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
        background-color: #e5e7eb;
    }

    .features {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
    }

    .feature {
        background-color: #f8fafc;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        flex: 1;
        min-width: 250px;
        max-width: 300px;
    }

    .feature h3 {
        color: #3b82f6;
        margin-top: 0;
    }

    @media (max-width: 768px) {
        .features {
            flex-direction: column;
            align-items: center;
        }

        .feature {
            width: 100%;
            max-width: 100%;
        }
    }
</style>
