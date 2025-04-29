<script lang="ts">
    import RegisterForm from '$lib/components/RegisterForm.svelte';
</script>

<svelte:head>
    <title>Register - Kanban Board</title>
</svelte:head>

<div class="register-page">
    <RegisterForm on:register={(event) => console.log('User registered:', event.detail)} />
</div>

<style>
    .register-page {
        padding: 2rem 0;
    }
</style>
