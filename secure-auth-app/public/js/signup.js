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
    document.getElementById('signup-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submission intercepted by JavaScript');
        
        // Clear previous messages
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const csrfToken = document.getElementById('csrf-token').value;
        
        // Client-side validation
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Password regex validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(password)) {
            showError('Password does not meet the requirements');
            return;
        }
        
        try {
            console.log('Attempting registration for user:', username);
            
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'same-origin'
            });
            
            // Try to parse the response as JSON, but handle cases where it might not be JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Error parsing registration response:', e);
                showError('Server returned an invalid response. Please try again later.');
                return;
            }
            
            if (!response.ok) {
                console.log('Registration failed with status:', response.status);
                
                if (data.errors && Array.isArray(data.errors)) {
                    // Format validation errors
                    const errorMessages = data.errors.map(err => err.msg).join('<br>');
                    showError(errorMessages);
                } else {
                    showError(data.error || 'Registration failed. Please try again.');
                }
                return;
            }
            
            console.log('Registration successful!');
            
            // Show success message
            showSuccess('Registration successful! You will be redirected to login page.');
            document.getElementById('signup-form').reset();
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred during registration. Please try again.');
        }
    });
    
    // Also handle the button click directly in case the form event isn't firing
    document.querySelector('#signup-form button[type="submit"]').addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('Button click detected, triggering form submission handler');
        
        // Simulate form submission
        const submitEvent = new Event('submit');
        document.getElementById('signup-form').dispatchEvent(submitEvent);
        
        return false;
    });
    
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
    }
    
    function showSuccess(message) {
        const successElement = document.getElementById('success-message');
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
});
