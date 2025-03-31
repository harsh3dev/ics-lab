document.addEventListener('DOMContentLoaded', async () => {
    // Fetch CSRF token
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        document.getElementById('csrf-token').value = data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        showError('Failed to load page security features. Please refresh.');
    }

    // Handle form submission
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Login form submission intercepted by JavaScript');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const csrfToken = document.getElementById('csrf-token').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, password }),
                credentials: 'same-origin'
            });
            
            // Try to parse the response as JSON, but handle cases where it might not be JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Error parsing response:', e);
                showError('Server returned an invalid response. Please try again later.');
                return;
            }
            
            if (!response.ok) {
                showError(data.error || 'Login failed. Please try again.');
                console.log('Login failed with status:', response.status);
                return;
            }
            
            // Show success message before redirecting
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page on successful login
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred during login. Please try again.');
        }
    });
    
    // Also handle the button click directly in case the form event isn't firing
    document.querySelector('#login-form button[type="submit"]').addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('Login button click detected, triggering form submission handler');
        
        // Simulate form submission
        const submitEvent = new Event('submit');
        document.getElementById('login-form').dispatchEvent(submitEvent);
        
        return false;
    });
    
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.className = 'error-message'; // Reset to error style
    }
    
    function showSuccess(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.className = 'error-message success-message';
    }
});
