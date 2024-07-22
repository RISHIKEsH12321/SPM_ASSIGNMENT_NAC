document.getElementById('newGameButton').addEventListener('click', () => {
    sessionStorage.removeItem('gameState');
    window.location.href = './freeplay.html';
});

document.getElementById('loadGameButton').addEventListener('click', () => {
    loadGame().then(() => {
        window.location.href = './freeplay.html';
    }).catch(error => {
        alert('Failed to load game');
    });
});

function loadGame() {
    return new Promise((resolve, reject) => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const userid = currentUser._id;

        fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load game state');
            }
            return response.json();
        })
        .then(data => {
            console.log('Game state loaded:', data);

            const gameState = data['freeplay-save'];
            sessionStorage.setItem('gameState', JSON.stringify(gameState));

            resolve();
        })
        .catch(error => {
            console.error('Error loading game state:', error);
            reject(error);
        });
    });
}