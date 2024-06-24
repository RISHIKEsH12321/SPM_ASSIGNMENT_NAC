window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});


document.getElementById('profile-link').addEventListener('click', function(event) {
    if (!sessionStorage.getItem('currentUser') && !localStorage.getItem('currentUser')) {
        event.preventDefault();
        window.location.href = './html/login.html';
    }
});