document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form values
    const name  = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Create the data object
    const data = {
        name: name ,
        email: email,
        password: password,
        'free-play-score': 0,
        'arcade-score': 0,
        'free-play-games-completed': 0,
        'aracde-games-completed': 0
    };

    // Send the POST request
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
        alert('Sign Up Successful!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Sign Up Failed!');
    });
});