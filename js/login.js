document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // database
        fetch(`https://spmassignment-a329.restdb.io/rest/player?q={"email":"${email}"}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            }
        })
        .then(response => response.json())
        .then(users => {
            if (users.length > 0) {
                const user = users[0];

                if (user.password === password) {

                    sessionStorage.setItem('User', JSON.stringify(user));
                    alert('Login Successful!');
                    
                    window.location.href='index.html'
                } else {
                    alert('Invalid password');
                }
            } else {
                alert('User not found');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Login Failed!');
        });
    });
});

// Add 'loaded' class to profile-wrapper after page loads
window.addEventListener('load', function() {
    document.getElementById('login-wrapper').classList.add('loaded');
});