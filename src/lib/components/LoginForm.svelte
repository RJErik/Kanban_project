<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let identifier = '';
    let password = '';
    let loading = false;
    let error = '';
    let success = '';

    async function handleSubmit() {
        if (!identifier || !password) {
            error = 'Please enter all fields';
            return;
        }

        error = '';
        loading = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();

            if (!response.ok) {
                error = data.error || 'Login failed';
                return;
            }

            success = 'Successfully logged in!';
            dispatch('login', data.user);

            setTimeout(() => {
                window.location.href = '/';
            }, 2000)

        } catch (err) {
            error = 'An error occurred during login';
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="login-form">
    <h2>Login to Your Account</h2>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if success}
        <div class="success">{success}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
            <label for="identifier">Username or Email</label>
            <input
                    type="text"
                    id="identifier"
                    bind:value={identifier}
                    disabled={loading}
                    placeholder="Enter username or email"
                    required
            />
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                    type="password"
                    id="password"
                    bind:value={password}
                    disabled={loading}
                    placeholder="Enter your password"
                    required
            />
        </div>

        <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
        </button>

        <div class="form-footer">
            <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
    </form>
</div>

<style>
    .login-form {
        max-width: 400px;
        margin: 0 auto;
        padding: 2rem;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h2 {
        text-align: center;
        margin-bottom: 1.5rem;
        color: #374151;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #4b5563;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    button {
        width: 100%;
        padding: 0.75rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:hover {
        background-color: #2563eb;
    }

    button:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
    }

    .error {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .success {
        background-color: #d1fae5;
        color: #047857;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .form-footer {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.875rem;
    }

    .form-footer a {
        color: #3b82f6;
        text-decoration: none;
    }

    .form-footer a:hover {
        text-decoration: underline;
    }
</style>
