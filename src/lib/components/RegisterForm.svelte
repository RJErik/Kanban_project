<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import ProfilePictureSelector from './ProfilePictureSelector.svelte';

    const dispatch = createEventDispatcher();

    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let profilePictureUrl = '';

    let step = 1;
    let loading = false;
    let error = '';
    let success = '';

    function validateBasicInfo() {
        if (!username || !email || !password || !confirmPassword) {
            error = 'All fields are required';
            return false;
        }

        if (password !== confirmPassword) {
            error = 'Passwords do not match';
            return false;
        }

        if (password.length < 6) {
            error = 'Password must be at least 6 characters long';
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            error = 'Please enter a valid email address';
            return false;
        }

        return true;
    }

    function goToProfilePictureStep() {
        error = '';
        if (validateBasicInfo()) {
            step = 2;
        }
    }

    function goBackToBasicInfo() {
        step = 1;
    }

    function handleProfilePictureSelect(event: CustomEvent<string>) {
        profilePictureUrl = event.detail;
        submitRegistration();
    }

    async function submitRegistration() {
        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    profilePictureUrl
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Registration response status:', response.status);
                console.error('Registration error response:', errorText);

                let errorMessage = 'Registration failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    errorMessage = errorText || errorMessage;
                }

                error = errorMessage;
                step = 1;
                return;
            }

            const data = await response.json();

            success = 'Registration successful! Redirecting...';
            dispatch('register', data.user);

            setTimeout(() => {
                window.location.href = '/';
            }, 2000)

        } catch (err) {
            console.error('Registration error:', err);
            error = err instanceof Error ? err.message : 'An error occurred during registration';
            step = 1;
        } finally {
            loading = false;
        }
    }
</script>

<div class="register-form">
    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if success}
        <div class="success">{success}</div>
    {/if}

    {#if step === 1}
        <h2>Create Your Account</h2>
        <form on:submit|preventDefault={goToProfilePictureStep}>
            <div class="form-group">
                <label for="username">Username</label>
                <input
                        type="text"
                        id="username"
                        bind:value={username}
                        disabled={loading}
                        placeholder="Choose a username"
                        required
                />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input
                        type="email"
                        id="email"
                        bind:value={email}
                        disabled={loading}
                        placeholder="Enter your email"
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
                        placeholder="Create a password"
                        required
                />
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                        type="password"
                        id="confirmPassword"
                        bind:value={confirmPassword}
                        disabled={loading}
                        placeholder="Confirm your password"
                        required
                />
            </div>

            <button type="submit" disabled={loading}>
                Continue to Profile Picture
            </button>

            <div class="form-footer">
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </form>
    {:else if step === 2}
        <ProfilePictureSelector
                on:back={goBackToBasicInfo}
                on:select={handleProfilePictureSelect}
        />
    {/if}
</div>

<style>
    .register-form {
        max-width: 800px;
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
