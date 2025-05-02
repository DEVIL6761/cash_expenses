document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:5001';

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const credentials = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = '/';
            } else {
                alert('Неверные учетные данные');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});