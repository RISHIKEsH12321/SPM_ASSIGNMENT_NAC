// Initialize the Game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game instance
    let game = new ArcadeGame();
    game.startNewGame();

    const modal = document.getElementById("gameOverModal");
    const restartBtn = modal.querySelector("#restartBtn");
    const menuBtn = modal.querySelector("#menuBtn");
    const quitBtn = document.querySelector("#quit-game");
    const infoBtn = document.querySelector("#info-button");

    infoBtn.addEventListener("click", ()=>{
        window.open("../html/about.html", '_blank');
    })

    restartBtn.addEventListener("click", () =>{
        game = new ArcadeGame();
        game.startNewGame();
        modal.style.display="none";
    });

    menuBtn.addEventListener("click", () =>{
        modal.style.display="none";
        window.location.href="../index.html"
    })

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.addEventListener("click", () => saveGame(game));

    const loadBtn = document.getElementById("loadBtn");
    loadBtn.addEventListener("click", () => loadGame(game));

    quitBtn.addEventListener("click", () => showQuitModal(game));
});


async function saveGame(game) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userid = currentUser._id;
    console.log(userid);

    const gameState = {
        gridSize: game.gridSize,
        coins: game.coins,
        points: game.points,
        turn: game.turn,
        grid: game.grid,
        currentBuildings: game.currentBuildings,
        selectedBuilding: game.selectedBuilding
    };

    try {
        const response = await fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load game state');
        }

        const data = await response.json();
        const existingGameState = data['arcade-save'];

        if (existingGameState) {
            return new Promise((resolve) => {
                const saveModal = document.getElementById('saveModal');
                saveModal.style.display = 'block';

                const saveYesBtn = document.getElementById('saveYesBtn');
                const saveNoBtn = document.getElementById('saveNoBtn');

                saveYesBtn.addEventListener('click', async () => {
                    saveModal.style.display = 'none';
                    const result = await saveGameState(gameState, userid);
                    resolve(result);
                });

                saveNoBtn.addEventListener('click', () => {
                    saveModal.style.display = 'none';
                    resolve(false);
                });
            });
        }

        return await saveGameState(gameState, userid);
    } catch (error) {
        console.error('Error loading game state:', error);
        return false;
    }
}

// Save game
async function saveGameState(gameState, userid) {
    try {
        const response = await fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({ 'arcade-save': gameState }),
        });

        if (!response.ok) {
            throw new Error('Failed to save game state');
        }

        console.log('Game state saved successfully');
        alert('Game saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving game state:', error);
        return false;
    }
}

// Loading of game
async function loadGame(game) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser._id;

    // Show the load confirmation modal
    const loadModal = document.getElementById('loadModal');
    loadModal.style.display = 'flex';

    const loadYesBtn = document.getElementById('loadYesBtn');
    const loadNoBtn = document.getElementById('loadNoBtn');

    // Detach any previously attached event listeners to avoid multiple bindings
    loadYesBtn.replaceWith(loadYesBtn.cloneNode(true));
    loadNoBtn.replaceWith(loadNoBtn.cloneNode(true));

    // Re-select the buttons after cloning
    const newLoadYesBtn = document.getElementById('loadYesBtn');
    const newLoadNoBtn = document.getElementById('loadNoBtn');

    // Load the game if the user confirms
    newLoadYesBtn.addEventListener('click', () => {
        loadModal.style.display = 'none';

        fetch(`https://spmassignment-a329.restdb.io/rest/player/${userId}`, {
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
            const gameState = data['arcade-save'];
            console.log(gameState);

            if (gameState) {
                game.gridSize = gameState.gridSize;
                game.coins = gameState.coins;
                game.points = gameState.points;
                game.turn = gameState.turn;
                game.grid = gameState.grid;
                game.currentBuildings = gameState.currentBuildings;
                game.selectedBuilding = gameState.selectedBuilding;

                // Render and update UI based on loaded game state
                game.renderGrid();
                game.renderCurrentBuildings();
                game.addEventListeners();
                game.updateHeaderInfo();

                console.log('Game state loaded successfully');
                alert('Game loaded successfully')
            } else {
                console.log('No saved game state found');
            }
        })
        .catch(error => {
            console.error('Error loading game state:', error);
        });
    });

    // Close the modal without loading if the user cancels
    newLoadNoBtn.addEventListener('click', () => {
        loadModal.style.display = 'none';
    });
}

function showQuitModal(game) {
    const quitModal = document.getElementById('quitModal');
    quitModal.style.display = 'block';

    const quitSaveYesBtn = document.getElementById('quitSaveYesBtn');
    const quitSaveNoBtn = document.getElementById('quitSaveNoBtn');
    const quitCancelBtn = document.getElementById('quitCancelBtn');

    quitSaveYesBtn.addEventListener('click', async () => {
        quitModal.style.display = 'none';
        const gameState = {
            gridSize: game.gridSize,
            coins: game.coins,
            points: game.points,
            turn: game.turn,
            grid: game.grid,
            currentBuildings: game.currentBuildings,
            selectedBuilding: game.selectedBuilding
        };
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const gameSaved = await saveGameState(gameState, currentUser._id);
        if (gameSaved){
            quitGame();
        } else{
            console.error('Failed to save data:', error);
            alert("Failed to save game");
        }
    });

    quitSaveNoBtn.addEventListener('click', () => {
        quitModal.style.display = 'none';
        quitGame();
    });

    quitCancelBtn.addEventListener('click', () => {
        quitModal.style.display = 'none';
    });
}

function quitGame() {
    console.log('Quitting game...');
    window.location.href = "../index.html";
}

class ArcadeGame {
    constructor() {
        this.gridSize = 20;
        this.coins = 16;
        this.points = 0;
        this.turn = 0;
        this.buildings = ['R', 'I', 'C', 'O', '*'];
        this.grid = this.createGrid();
        this.currentBuildings = [];
        this.placedBuildings = [];
        this.selectedBuilding = null;
        this.isModalOpen = false;

        this.initUI();
    }

    createGrid() {
        const grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            const row = [];
            for (let j = 0; j < this.gridSize; j++) {
                row.push(null);
            }
            grid.push(row);
        }
        return grid;
    }

    initUI() {
        this.updateHeaderInfo();
        this.renderGrid();
        this.addEventListeners();
    }

    async startNewGame() {
        this.updateHeaderInfo();
        this.selectRandomBuildings();
        this.renderCurrentBuildings();
    }

    updateHeaderInfo() {
        document.querySelector('.header-info .info-box:nth-child(1)').innerText = `Points: ${this.points}`;
        document.querySelector('.header-info .info-box:nth-child(2)').innerText = `Turn: ${this.turn}`;
        document.querySelector('.header-info .info-box:nth-child(3)').innerText = `Coins: ${this.coins}`;
    }


    // Randomly Select Buildings
    selectRandomBuildings() {
        const randomIndex1 = Math.floor(Math.random() * this.buildings.length);
        let randomIndex2;
        do {
            randomIndex2 = Math.floor(Math.random() * this.buildings.length);
        } while (randomIndex2 === randomIndex1);

        this.currentBuildings = [this.buildings[randomIndex1], this.buildings[randomIndex2]];
        this.selectedBuilding = this.currentBuildings[0]; // Default to the first building

        this.renderCurrentBuildings();
    }

    renderCurrentBuildings() {
        const iconBar = document.querySelector('.icon-bar');
        iconBar.innerHTML = '';
        this.currentBuildings.forEach((building, index) => {
            const iconDiv = document.createElement('div');
            iconDiv.classList.add('icon');
            
            // Create draggable image
            const img = document.createElement('img');
            img.src = `../images/${this.getBuildingImage(building)}`;
            img.alt = building;
            img.dataset.index = index;
            img.draggable = true; // Make the image draggable
            img.addEventListener('dragstart', (event) => this.dragStart(event));

            const buildingType = document.createElement('p');
            const buildingName = this.getBuildingImage(building).substring(0, this.getBuildingImage(building).length - 4);
            console.log(buildingName);
            buildingType.textContent = buildingName;
            
            iconDiv.appendChild(img);
            iconDiv.appendChild(buildingType);
            iconBar.appendChild(iconDiv);
        });
    }

    // Add dragstart event handler to set selectedBuilding
    dragStart(event) {
        const index = event.target.dataset.index;
        this.selectedBuilding = this.currentBuildings[index];
    }

    // Add dragover and drop event listeners to grid cells
    addEventListeners() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.addEventListener('dragover', (event) => this.dragOver(event));
            cell.addEventListener('dragenter', (event) => this.dragEnter(event));
            cell.addEventListener('drop', (event) => this.drop(event));
        });
    }

    // Implement dragover, dragenter, and drop handlers
    dragOver(event) {
        event.preventDefault();
    }

    dragEnter(event) {
        event.preventDefault();
        const cell = event.target;
        cell.classList.add('drag-over');
    }

    // Update drop() to handle placement based on adjacency
    drop(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Check if the cell already has a building
        if (this.grid[row][col] !== null) {
            this.demolishBuilding(row, col);
            this.placeBuilding(row, col);
            this.updateCoinsAndPoints();
            this.turn++;
            this.updateHeaderInfo();
            this.selectRandomBuildings();
            this.renderGrid();
            this.placedBuildings.push(this.grid[row][col]);
            this.renderCurrentBuildings();
            this.addEventListeners();
        } else if (this.selectedBuilding && this.isValidPlacement(row, col)) {
            this.placeBuilding(row, col);
            this.updateCoinsAndPoints();
            this.turn++;
            this.updateHeaderInfo();
            this.selectRandomBuildings();
            this.renderGrid();
            this.placedBuildings.push(this.grid[row][col]);
            this.renderCurrentBuildings();
            this.addEventListeners();
        }

        cell.classList.remove('drag-over');

        // Check if game over
        if (this.coins <= 0) {
            this.gameOver();
        }

        // Check if the grid is fully filled
        if (this.isGridFullyFilled()) {
            this.gameOver();
        }
    }

    // Method to check if the grid is fully filled
    isGridFullyFilled() {
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                if (this.grid[row][col] === null) {
                    return false; // Found an empty cell
                }
            }
        }
        return true; // No empty cells found
    }

    // Check if a cell is valid for placement based on adjacency to existing buildings
    isValidPlacement(row, col) {
        if (this.turn === 0){
            return true;
        } else{
            // Check all 8 possible directions around the cell
            const directions = [
                { dx: -1, dy: -1 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 },
                { dx: 0, dy: -1 },                     { dx: 0, dy: 1 },
                { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }
            ];

            for (const dir of directions) {
                const r = row + dir.dx;
                const c = col + dir.dy;

                if (this.isValidCell(r, c) && this.grid[r][c] !== null) {
                    return true; // Return true if any adjacent cell contains a building
                }
            }

            alert("Invalid Building placement. Please make sure to build on squares that are connected to existing building")
            return false; // Return false if no adjacent cells contain a building
        }
    }

    getBuildingImage(building) {
        switch (building) {
            case 'R': return 'Residential.png';
            case 'I': return 'Industrial.png';
            case 'C': return 'Commercial.png';
            case 'O': return 'Park.png';
            case '*': return 'Road.png';
        }
    }
    
    placeBuilding(row, col) {
        this.grid[row][col] = this.selectedBuilding;
        console.log(this.selectedBuilding);
        this.selectedBuilding = null; // Reset selectedBuilding after placement
    }

    renderGrid() {
        const gridContainer = document.querySelector('.grid-container');
        gridContainer.innerHTML = '';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (this.grid[i][j] !== null) {
                    const buildingImg = document.createElement('img');
                    buildingImg.src = `../images/${this.getBuildingImage(this.grid[i][j])}`
                    buildingImg.style.width="100%";
                    buildingImg.style.height="100%";
                    buildingImg.dataset.row = i;
                    buildingImg.dataset.col = j;

                    cell.appendChild(buildingImg);
                    // Add onclick event listener to demolish the building on click
                    cell.addEventListener('click', () => {
                        if (cell.querySelector('.demolishmodal')){
                            return
                        } else{
                            this.demolishBuilding(i, j);
                        }
                    });
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    updateCoinsAndPoints() {
        let newCoins = this.coins;
        let newPoints = 0;
    
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, // up, down
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }  // left, right
        ];
    
        // Temporary storage for connected roads in the same row
        const roadSegmentsInRow = Array(this.gridSize).fill(0);
    
        // Iterate over the grid to calculate points and coins
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const building = this.grid[i][j];
                if (!building) continue;
    
                let adjacentBuildings = {
                    'R': 0,
                    'I': 0,
                    'C': 0,
                    'O': 0,
                    '*': 0
                };
    
                // Check adjacent cells
                for (const dir of directions) {
                    const r = i + dir.dx;
                    const c = j + dir.dy;
    
                    if (this.isValidCell(r, c) && this.grid[r][c]) {
                        adjacentBuildings[this.grid[r][c]]++;
                    }
                }
    
                switch (building) {
                    case 'R':
                        if (adjacentBuildings['I'] > 0) {
                            newPoints += 1;
                        } else {
                            newPoints += adjacentBuildings['R'] + adjacentBuildings['C'] + (2 * adjacentBuildings['O']);
                        }
                        newCoins += 1; // Generates 1 coin per turn
                        break;
                    case 'I':
                        newPoints += 1; // Scores 1 point per industry in the city
                        newCoins += 1; // Generates 2 coins per turn
                        newCoins += adjacentBuildings['R']; // Generates 1 coin per adjacent residential
                        break;
                    case 'C':
                        newPoints += adjacentBuildings['C']; // Scores 1 point per adjacent commercial
                        newCoins += 1; // Generates 3 coins per turn
                        newCoins += adjacentBuildings['R']; // Generates 1 coin per adjacent residential
                        break;
                    case 'O':
                        newPoints += adjacentBuildings['O']; // Scores 1 point per adjacent park
                        newCoins -= 1; // Costs 1 coin to upkeep
                        break;
                    case '*':
                        // Count the road segments in the same row
                        roadSegmentsInRow[i]++;
                        break;
                }
            }
        }
    
        // Calculate points for road segments
        for (let i = 0; i < this.gridSize; i++) {
            if (roadSegmentsInRow[i] > 1) {
                newPoints += roadSegmentsInRow[i];
            } else if (roadSegmentsInRow[i] === 1) {
                newCoins -= 1; // Unconnected road segment costs 1 coin
            }
        }
    
        // Deduct upkeep costs for clusters of residential buildings
        const visited = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(false));
        const directionsCluster = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
    
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 'R' && !visited[i][j]) {
                    let queue = [{ x: i, y: j }];
                    visited[i][j] = true;
                    let clusterSize = 0;
    
                    while (queue.length > 0) {
                        const { x, y } = queue.shift();
                        clusterSize++;
    
                        for (const dir of directionsCluster) {
                            const r = x + dir.dx;
                            const c = y + dir.dy;
    
                            if (this.isValidCell(r, c) && this.grid[r][c] === 'R' && !visited[r][c]) {
                                visited[r][c] = true;
                                queue.push({ x: r, y: c });
                            }
                        }
                    }
    
                    newCoins -= Math.ceil(clusterSize / 4); // Each cluster of 4 residential buildings requires 1 coin
                }
            }
        }
    
        this.coins = newCoins;
        this.points = newPoints;
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }

    gameOver() {
        // Disable event listeners
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.removeEventListener('dragover', this.dragOver);
            cell.removeEventListener('dragenter', this.dragEnter);
            cell.removeEventListener('drop', this.drop);
        });

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const userid = currentUser._id;
        console.log(currentUser['arcade-games-completed']);
        const arcadeGamesCompleted = parseInt(currentUser['arcade-games-completed']) + 1;
        console.log(arcadeGamesCompleted);
        console.log(currentUser['arcade-score']);
        if (this.points > currentUser['arcade-score']){
            currentUser['arcade-score'] = parseInt(this.points);
            console.log('arcade-score updated');
        }
        console.log(currentUser['arcade-score']);

        const gameState = {
            gridSize: this.gridSize,
            coins: this.coins,
            points: this.points,
            turn: this.turn,
            grid: this.grid,
            currentBuildings: this.currentBuildings,
            selectedBuilding: this.selectedBuilding
        };

        fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({ 'arcade-save': gameState, 'final-points': this.points, 'arcade-games-completed': arcadeGamesCompleted, 'arcade-play-score': this.points  }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save final game state');
            }
            console.log('Final game state saved successfully');
            currentUser['arcade-games-completed'] = arcadeGamesCompleted;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        })
        .catch(error => {
            console.error('Error saving final game state:', error);
        });
    
        // Display game over modal
        const modal = document.getElementById("gameOverModal");
        modal.style.display = "flex";
    }

    demolishBuilding(row, col) {
        console.log("DemolishBuilding Activated");
        // Check if there's already a demolish modal
        if (document.body.querySelector('.demolishmodal')) {
            return; // If modal already exists, do nothing
        }

        // Create demolish modal
        console.log("Creating Modal");
        const demolishmodal = document.createElement('div');
        demolishmodal.classList.add('demolishmodal');

        const modalContent = document.createElement('div');
        modalContent.classList.add('demolishmodal-content');

        const confirmText = document.createElement('p');
        confirmText.textContent = 'Are you sure you want to demolish this building?';

        const btnContainer = document.createElement('div');
        btnContainer.classList.add('demolishmodal-btn-container');

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Yes';
        const noBtn = document.createElement('button');
        noBtn.textContent = 'No';

        btnContainer.appendChild(yesBtn);
        btnContainer.appendChild(noBtn);

        modalContent.appendChild(confirmText);
        modalContent.appendChild(btnContainer);

        demolishmodal.appendChild(modalContent);
        document.body.appendChild(demolishmodal); // Append to body

        this.isModalOpen = true;
    
       // Event listener for 'Yes' button
        yesBtn.addEventListener('click', () => {
            if (this.placedBuildings.length < 2) {
                alert("You cannot demolish the last building.");
            } else {
                this.confirmDemolish(row, col);
            }
            this.isModalOpen = false;
            demolishmodal.remove(); // Remove the modal from DOM
        });

        // Event listener for 'No' button
        noBtn.addEventListener('click', () => {
            this.isModalOpen = false;
            demolishmodal.remove(); // Remove the modal from DOM
            console.log("Removed Modal");
        });
    }    
    

    confirmDemolish(row, col) {
        if (this.grid[row][col] !== null) {
            console.log(this.grid[row][col]);
            // Remove the first occurrence of demolished building from this.buildings
            const indexToRemove = this.placedBuildings.indexOf(this.grid[row][col]);
            console.log(indexToRemove);
            if (indexToRemove !== -1) {
                this.placedBuildings.splice(indexToRemove, 1);
            }
            console.log(this.placedBuildings);
            this.grid[row][col] = null; // Remove the building
            this.coins--; // Deduct 1 coin for demolition
            this.updateHeaderInfo();
            this.renderGrid();
            this.renderCurrentBuildings();
            this.addEventListeners();
        }
    }

}
