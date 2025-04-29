<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    let images: string[] = [];
    let selectedImageUrl: string | null = null;
    let loading = false;
    let error = '';

    function generateImageUrls(count: number): string[] {
        return Array.from({ length: count }, (_, i) =>
            `https://picsum.photos/seed/${i}-${Date.now()}/300/300`
        );
    }

    function loadImages() {
        loading = true;
        error = '';

        try {
            images = generateImageUrls(9);

            if (!selectedImageUrl && images.length > 0) {
                selectedImageUrl = images[0];
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to generate image URLs';
            console.error(err);
        } finally {
            loading = false;
        }
    }

    function refreshImages() {
        loadImages();
    }

    function selectImage(imageUrl: string) {
        selectedImageUrl = imageUrl;
    }

    function confirmSelection() {
        if (selectedImageUrl) {
            dispatch('select', selectedImageUrl);
        }
    }

    onMount(() => {
        loadImages();
    });
</script>

<div class="profile-picture-selector">
    <h3>Choose a Profile Picture</h3>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="refresh-bar">
        <button on:click={refreshImages} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Images'}
        </button>
    </div>

    {#if loading}
        <div class="loading">Loading images...</div>
    {:else}
        <div class="image-grid">
            {#each images as imageUrl, i}
                <div
                        class="image-container"
                        class:selected={selectedImageUrl === imageUrl}
                        on:click={() => selectImage(imageUrl)}
                        on:keydown={(e) => e.key === 'Enter' && selectImage(imageUrl)}
                        tabindex="0"
                        role="button"
                        aria-label={`Select image ${i+1}`}
                >
                    <img src={imageUrl} alt={`Image option ${i+1}`} loading="lazy" />
                    {#if selectedImageUrl === imageUrl}
                        <div class="selected-indicator">✓</div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <div class="actions">
        <button class="back-btn" on:click={() => dispatch('back')}>
            Back
        </button>
        <button
                class="confirm-btn"
                on:click={confirmSelection}
                disabled={!selectedImageUrl}
        >
            Confirm Selection
        </button>
    </div>
</div>

<style>
    .profile-picture-selector {
        max-width: 800px;
        margin: 0 auto;
    }

    h3 {
        margin-bottom: 1rem;
        color: #374151;
    }

    .refresh-bar {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .refresh-bar button {
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }

    .refresh-bar button:hover {
        background-color: #2563eb;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .image-container {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .image-container:hover {
        transform: scale(1.02);
    }

    .image-container.selected {
        box-shadow: 0 0 0 3px #3b82f6;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .selected-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 25px;
        height: 25px;
        background-color: #3b82f6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }

    .error {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .actions {
        display: flex;
        justify-content: space-between;
    }

    .back-btn {
        padding: 0.75rem 1.5rem;
        background-color: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }

    .confirm-btn {
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }

    .confirm-btn:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
    }
</style>
