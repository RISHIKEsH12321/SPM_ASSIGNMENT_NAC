function toggleButton(buttonId) {
    const buttons = document.querySelectorAll('.GameType');
    buttons.forEach(button => {
        if (button.id === buttonId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

const ArcadeBtn = document.getElementById("ArcadeGameType");
const FreePlayBtn = document.getElementById("FreePlayGameType");

// const user = {"_id":"6668468f16aedf0100001a39","email":"yechyang@gmail.com","free-play-score":1515151,"arcade-score":99999999,"free-play-games-completed":0,"password":"123456","name":"yechyang","arcade-games-completed":0};

// sessionStorage.setItem('currentUser', JSON.stringify(user));
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
console.log(currentUser);

// data = [
//     {
//         "_id": "6668468f16aedf0100001a39",
//         "email": "yechyang@gmail.com",
//         "free-play-score": 1515151,
//         "arcade-score": 99999999,
//         "free-play-games-completed": 0,
//         "password": "123456",
//         "name": "yechyang",
//         "arcade-games-completed": 0
//     },
//     {
//         "_id": "66670f8716aedf0100000abe",
//         "name": "Optimus Prime",
//         "email": "ian@gmail.com",
//         "free-play-score": 999,
//         "arcade-score": 800,
//         "free-play-games-completed": 10,
//         "password": "pass",
//         "arcade-games-completed": 20,
//         "profileName": "Optimus Prime"
//     },
//     {
//         "_id": "66670d3216aedf0100000a9b",
//         "name": "BumbleBee",
//         "email": "yechyang@gmail.com",
//         "free-play-score": 100,
//         "arcade-score": 99,
//         "free-play-games-completed": 1,
//         "password": "1234567890",
//         "arcade-games-completed": 2
//     },
//     {
//         "_id": "666846ee16aedf0100001a3e",
//         "email": "wick@gmail.com",
//         "free-play-score": 0,
//         "arcade-score": 0,
//         "free-play-games-completed": 0,
//         "password": "PASSWORD",
//         "name": "John Wick",
//         "arcade-games-completed": 0
//     }
// ]


ArcadeBtn.addEventListener("click", () => {
    toggleButton("ArcadeGameType");
    getRanks("Arcade");
})

FreePlayBtn.addEventListener("click", () => {
    toggleButton("FreePlayGameType");
    getRanks("Free Play");
})

const getRanks = (GameType) => {
    fetch(`https://spmassignment-a329.restdb.io/rest/player`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': '6667013f85f7f679ab63cd2a',
            'cache-control': 'no-cache'
        }
    })    
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (GameType === "Arcade") {
            data.sort((a, b) => b['arcade-score'] - a['arcade-score']);
        } else if (GameType === "Free Play") {
            data.sort((a, b) => b['free-play-score'] - a['free-play-score']);
        }
        updateLeaderboard(data, GameType);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}

const updateLeaderboard = (data, GameType) => {
    const rankList = document.getElementById("rankList");
    rankList.innerHTML = ''; // Clear existing ranks

    let currentUserRank = -1;

    // Display top 10 ranks
    data.slice(0, 10).forEach((player, index) => {
        const rankContainer = document.createElement('div');
        rankContainer.classList.add('rank-container');

        const rank = document.createElement('div');
        rank.classList.add('rank');
        rank.textContent = getRankText(index + 1);
        rankContainer.appendChild(rank);

        const playerName = document.createElement('div');
        playerName.classList.add('player-name');
        playerName.textContent = player.name;
        rankContainer.appendChild(playerName);

        const score = document.createElement('div');
        score.classList.add('score');
        score.textContent = GameType === "Arcade" ? player["arcade-score"] : player["free-play-score"];
        rankContainer.appendChild(score);

        rankList.appendChild(rankContainer);

        // Check if the current user is in the top 10
        if (player._id === currentUser._id) {
            currentUserRank = index + 1;
        }
    });

    // If the current user is not in the top 10, display them separately
    if (currentUserRank === -1) {
        data.forEach((player, index) => {
            if (player._id === currentUser._id) {
                currentUserRank = index + 1;
                const rankContainer = document.createElement('div');
                rankContainer.classList.add('rank-container');

                const rank = document.createElement('div');
                rank.classList.add('rank');
                rank.textContent = getRankText(currentUserRank);
                rankContainer.appendChild(rank);

                const playerName = document.createElement('div');
                playerName.classList.add('player-name');
                playerName.textContent = player.name;
                rankContainer.appendChild(playerName);

                const score = document.createElement('div');
                score.classList.add('score');
                score.textContent = GameType === "Arcade" ? player["arcade-score"] : player["free-play-score"];
                rankContainer.appendChild(score);

                rankList.appendChild(rankContainer);
            }
        });
    }
}

// Function to convert index to rank text
const getRankText = (rank) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
}

// Initial load for Arcade scores
getRanks("Arcade");
