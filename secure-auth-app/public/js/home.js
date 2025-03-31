document.addEventListener('DOMContentLoaded', async () => {
    const loadingElement = document.getElementById('loading');
    const notLoggedInElement = document.getElementById('not-logged-in');
    const loggedInContentElement = document.getElementById('logged-in-content');
    const errorMessageElement = document.getElementById('error-message');
    
    // Check if user is logged in
    try {
        console.log('Attempting to fetch user profile...');
        const response = await fetch('/api/profile', {
            credentials: 'same-origin'
        });
        
        console.log('Profile response status:', response.status);
        
        if (!response.ok) {
            // User is not logged in
            console.log('User not logged in, showing login prompt');
            loadingElement.style.display = 'none';
            notLoggedInElement.style.display = 'block';
            return;
        }
        
        // Try to parse the response as JSON, but handle cases where it might not be JSON
        let data;
        try {
            data = await response.json();
            console.log('Profile data received:', data);
        } catch (e) {
            console.error('Error parsing profile response:', e);
            showError('Server returned an invalid response. Please refresh the page.');
            loadingElement.style.display = 'none';
            return;
        }
        
        if (!data || !data.user) {
            console.error('No user data in response');
            showError('No user data found. Please login again.');
            loadingElement.style.display = 'none';
            notLoggedInElement.style.display = 'block';
            return;
        }
        
        // Display user information
        document.getElementById('username-display').textContent = data.user.username;
        document.getElementById('profile-username').textContent = data.user.username;
        document.getElementById('profile-email').textContent = data.user.email;
        
        loadingElement.style.display = 'none';
        loggedInContentElement.style.display = 'block';
    } catch (error) {
        console.error('Error checking authentication:', error);
        showError('An error occurred while loading the page. Please refresh.');
        loadingElement.style.display = 'none';
    }
    
    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            console.log('Getting CSRF token for logout...');
            // Get CSRF token first
            const csrfResponse = await fetch('/api/csrf-token');
            const csrfData = await csrfResponse.json();
            
            console.log('Attempting to logout...');
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfData.csrfToken
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                const data = await response.json();
                showError(data.error || 'Logout failed. Please try again.');
                return;
            }
            
            console.log('Logout successful, redirecting to login page');
            // Redirect to login page
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('An error occurred during logout. Please try again.');
        }
    });
    
    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
});
