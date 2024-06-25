window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});


document.getElementById('profile-link').addEventListener('click', function(event) {
    if (!sessionStorage.getItem('currentUser') && !localStorage.getItem('currentUser')) {
        event.preventDefault();
        alert("Please Login/Register an account.")
        window.location.href = './html/login.html';
    }
});