document.addEventListener("DOMContentLoaded", function () {
    const APIKEY = "6667013f85f7f679ab63cd2a";
    
    const arcadeGameCompleted = document.getElementById("arcade-game-completed");
    const freePlayCompleted = document.getElementById("freeplay-game-completed");
    const arcadeHighScores = document.getElementById("arcade-high-scores");
    const freePlayHighScores = document.getElementById("freeplay-high-scores");

    // Function to animate counter
    function animateCounter(element, start, end, duration) {
        let range = end - start;
        let current = start;
        let increment = end > start ? 1 : -1;
        let startTime = null;

        function updateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = timestamp - startTime;
            let easingProgress = easeOutCubic(progress, 0, 1, duration);
            current = start + Math.floor(easingProgress * range);
            element.textContent = current;
            
            if (progress < duration) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // Easing function
    function easeOutCubic(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    }

    // Function to update UI with user data
    function updateUserUI(user) {
        document.getElementById('profile-name').value = user.name;
        animateCounter(arcadeGameCompleted, 0, user["arcade-games-completed"], 3000);
        animateCounter(freePlayCompleted, 0, user["free-play-games-completed"], 3000);
        animateCounter(arcadeHighScores, 0, user["arcade-score"], 3000);
        animateCounter(freePlayHighScores, 0, user["free-play-score"], 3000);
    }

    const storedUser = sessionStorage.getItem('User');

    if (storedUser) {
        const user = JSON.parse(storedUser);
        const email = user.email; // Assuming the user object contains an email field

        // Fetch user data from API based on email
        fetch(`https://spmassignment-a329.restdb.io/rest/player?q={"email":"${email}"}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': APIKEY,
                'cache-control': 'no-cache'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                console.log("fetched user data");
                const fetchedUser = data[0]; // Assuming the API returns an array of users and you need the first one
                // Update UI with fetched user data
                updateUserUI(fetchedUser);
            } else {
                console.log('User not found');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    } else {
        console.log('No user data found in sessionStorage.');
    }
});

// Add 'loaded' class to profile-wrapper after page loads
window.addEventListener('load', function() {
    document.getElementById('profile-wrapper').classList.add('loaded');
});


const nameInput = document.getElementById("profile-name");
const editIcon = document.getElementById("edit-icon");

function focusInput() {
    nameInput.focus();
    nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
}

function blurInput() {
    nameInput.blur();
}

function onInputBlur() {
    if (nameInput.value.length === 0){
        focusInput(); // If input is empty, focus it again
    }
}

// Add an event listener for click event on document (to detect clicks outside the input field)
document.addEventListener("click", function(event) {
    // Check if the click target is not the input field
    if (event.target !== nameInput) {
        blurInput();
        onInputBlur(); // Check if input is empty when clicked outside
    }
    if (event.target === editIcon){
        focusInput();
    }
});


const saveBtn = document.getElementById("save-name-btn");
saveBtn.addEventListener('click', function () {
    const changedUsername = nameInput.value;
    
    // Retrieve the current user from sessionStorage
    const storedUser = sessionStorage.getItem('User');
    const APIKEY = "6667013f85f7f679ab63cd2a";
    if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user._id; // Assuming the user object contains an _id field
        console.log(userId);

        // Prepare the data to be updated
        const updatedUser = {
            ...user,
            name: changedUsername
        };

        // Send a PUT request to update the user's profile name
        fetch(`https://spmassignment-a329.restdb.io/rest/player/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': APIKEY,
                'cache-control': 'no-cache'
            },
            body: JSON.stringify(updatedUser)
        })
        .then(response => response.json())
        .then(updatedUser => {
            // Update the sessionStorage with the new user data
            sessionStorage.setItem('User', JSON.stringify(updatedUser));
            
            // Optionally, update the UI or notify the user that the update was successful
            alert('Username updated successfully!');
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            alert('Failed to update username.');
        });
    } else {
        alert('No user data found in sessionStorage.');
    }
});

const logOutBtn = document.getElementById('logout-button');
logOutBtn.addEventListener('click', () => {
    sessionStorage.setItem('User', null);
    window.location.href="login.html";
});
