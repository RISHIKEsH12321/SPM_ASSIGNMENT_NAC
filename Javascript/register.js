document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form values
    const name  = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Create the data object
    const data = {
        name: name,
        email: email,
        password: password,
        'free-play-score': 0,
        'arcade-score': 0,
        'free-play-games-completed': 0,
        'arcade-games-completed': 0
    };

    fetch(`https://spmassignment-a329.restdb.io/rest/player?q={"name":"${name}"}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': '6667013f85f7f679ab63cd2a',
            'cache-control': 'no-cache'
        }
    })
    .then(response => response.json())
    .then(existingUsers => {
        if (existingUsers.length > 0) {
            // document.getElementById('username-exists-modal').style.display = 'block';
            showModal('Username already exists. Please choose a different username.', 'caution');
        } else {
            fetch('https://spmassignment-a329.restdb.io/rest/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-apikey': '6667013f85f7f679ab63cd2a',
                    'cache-control': 'no-cache'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                showModal('Sign Up Successful!','success');
            })
            .catch((error) => {
                console.error('Error:', error);
                showModal('Sign Up Failed!', 'caution');
            });
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        showModal('Failed to check if username exists. (database error)', 'caution');
    });
});


function showModal(message, type) {
    const modalMessage = document.getElementById('modal-message');
    const cautionLottie = document.getElementById('cautionLottie');
    const successLottie = document.getElementById('successLottie');

    modalMessage.innerText = message;

    if (type === 'caution') {
        cautionLottie.style.display = 'block';
        successLottie.style.display = 'none';
    } else if (type === 'success') {
        cautionLottie.style.display = 'none';
        successLottie.style.display = 'block';
    }
    document.getElementById('dynamic-modal').style.display = 'block';
}

document.querySelector('.modal .close').addEventListener('click', function() {
    document.getElementById('dynamic-modal').style.display = 'none';
});

window.onclick = function(event) {
    if (event.target == document.getElementById('dynamic-modal')) {
        document.getElementById('dynamic-modal').style.display = 'none';
    }
};



function updatePasswordStrength() {
    var password = document.getElementById('password').value;
    var strengthMeter = document.getElementById('password-strength-meter');
    var strengthText = document.getElementById('password-strength-text');

    if (password === "") {
        // Hide the meter and text when the password field is empty
        strengthMeter.style.display = 'none';
        strengthText.style.display = 'none';
        return;
    } else {
        // Show the meter and text when there is input
        strengthMeter.style.display = 'block';
        strengthText.style.display = 'block';
    }

    var strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    strengthMeter.value = strength;

    var strengthMessage = '';
    switch (strength) {
        case 0:
        case 1:
            strengthMessage = 'Very Weak';
            break;
        case 2:
            strengthMessage = 'Weak';
            break;
        case 3:
            strengthMessage = 'Medium';
            break;
        case 4:
            strengthMessage = 'Strong';
            break;
        case 5:
            strengthMessage = 'Very Strong';
            break;
    }

    strengthText.textContent = strengthMessage;
}