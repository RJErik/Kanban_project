<script lang="ts">
    import LoginForm from '$lib/components/LoginForm.svelte';
</script>

<svelte:head>
    <title>Login - Kanban Board</title>
</svelte:head>

<div class="login-page">
    <LoginForm on:login={(event) => console.log('User logged in:', event.detail)} />
</div>

<style>
    .login-page {
        padding: 2rem 0;
    }
</style>
