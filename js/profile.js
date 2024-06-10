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

// Add 'loaded' class to profile-wrapper after page loads
window.addEventListener('load', function() {
    document.getElementById('profile-wrapper').classList.add('loaded');
});

// Number increase counter animation
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

// Usage example:
animateCounter(document.getElementById('arcade-game-completed'), 0, 12, 3000); // From 0 to 12 in 3 seconds
animateCounter(document.getElementById('freeplay-game-completed'), 0, 30, 3000); // From 0 to 30 in 3 seconds
animateCounter(document.getElementById('arcade-high-scores'), 0, 800, 3000); // From 0 to 800 in 3 seconds
animateCounter(document.getElementById('freeplay-high-scores'), 0, 900, 3000); // From 0 to 900 in 3 seconds