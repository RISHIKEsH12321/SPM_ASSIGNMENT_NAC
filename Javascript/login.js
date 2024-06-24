document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');

    loginForm.addEventListener('submit', function(event) {
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
                    console.log("login successful")
                    sessionStorage.setItem('currentUser', JSON.stringify(user));

                    successModal.style.display = 'block';

                    const closeButton = successModal.querySelector('.close');
                    closeButton.addEventListener('click', function() {
                        successModal.style.display = 'none';
                    });

                    // setTimeout(function() {
                    //     window.location.href = 'dashboard.html';
                    // }, 2000);

                } else {
                    errorModal.style.display = 'block';

                    const errorCloseButton = errorModal.querySelector('.close');
                    errorCloseButton.addEventListener('click', function() {
                        errorModal.style.display = 'none';
                    });
                }
            } else {
                errorModal.style.display = 'block';

                const errorCloseButton = errorModal.querySelector('.close');
                errorCloseButton.addEventListener('click', function() {
                    errorModal.style.display = 'none';
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Login Failed!');
        });
    });
});
