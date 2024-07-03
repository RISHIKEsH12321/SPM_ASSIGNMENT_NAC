// Initialize the Game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game instance
    let game = new ArcadeGame();
    game.startNewGame();

    const modal = document.getElementById("gameOverModal");
    const restartBtn = modal.querySelector("#restartBtn");
    const menuBtn = modal.querySelector("#menuBtn");

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
});


// Saving of game
async function saveGame(game) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userid = currentUser._id
    console.log(userid)

    const gameState = {
        gridSize: game.gridSize,
        coins: game.coins,
        points: game.points,
        turn: game.turn,
        grid: game.grid,
        currentBuildings: game.currentBuildings,
        selectedBuilding: game.selectedBuilding
    };

    fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': '6667013f85f7f679ab63cd2a',
            'cache-control': 'no-cache'

        },
        body: JSON.stringify({ 'arcade-save': gameState }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save game state');
        }
        console.log('Game state saved successfully');
    })
    .catch(error => {
        console.error('Error saving game state:', error);
    });
}

class ArcadeGame {
    constructor() {
        this.gridSize = 20;
        this.coins = 1;
        this.points = 0;
        this.turn = 0;
        this.buildings = ['R', 'I', 'C', 'O', '*'];
        this.grid = this.createGrid();
        this.currentBuildings = [];
        this.selectedBuilding = null;

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

    startNewGame() {
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

        if (this.selectedBuilding && this.isValidPlacement(row, col)) {
            this.placeBuilding(row, col);
            this.updateCoinsAndPoints();
            this.turn++;
            this.updateHeaderInfo();
            this.selectRandomBuildings();
            this.renderGrid();
            this.renderCurrentBuildings();
            this.addEventListeners();
        }

        cell.classList.remove('drag-over');

        // Check if game over
        if (this.coins <= 0) {
            this.gameOver();
        }
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
                    cell.appendChild(buildingImg);
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    updateCoinsAndPoints() {   
        // Recalculate based on current grid state
        const clusters = {};
    
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const building = this.grid[i][j];
                if (building) {
                    switch (building) {
                        case 'R':
                            this.coins++;
                            this.points += this.calculateResidentialPoints(i, j);
                            clusters[`R_${i}_${j}`] = true;
                            break;
                        case 'I':
                            this.coins += 2;
                            this.points += this.calculateIndustryPoints(i, j);
                            break;
                        case 'C':
                            this.coins += 3;
                            this.points += this.calculateCommercialPoints(i, j);
                            break;
                        case 'O':
                            this.points += this.calculateParkPoints(i, j);
                            break;
                        case '*':
                            this.points += this.calculateRoadPoints(i, j);
                            break;
                    }
                }
            }
        }
    
        // Deduct upkeep costs
        Object.keys(clusters).forEach(cluster => {
            this.coins--;
        });
    
        console.log(this.currentBuildings);
    
        this.coins--; // Deduct 1 coin for placing a building
    }

    calculateResidentialPoints(row, col) {
        let points = 0;
    
        // Check all 8 possible directions around the cell
        const directions = [
            { dx: -1, dy: -1 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 },
            { dx: 0, dy: -1 },                     { dx: 0, dy: 1 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }
        ];
    
        let hasIndustry = false;
        directions.forEach(dir => {
            const r = row + dir.dx;
            const c = col + dir.dy;
    
            if (this.isValidCell(r, c)) {
                const building = this.grid[r][c];
                if (building === 'R' || building === 'C') {
                    points++;
                } else if (building === 'O') {
                    points += 2;
                } else if (building === 'I') {
                    hasIndustry = true;
                }
            }
        });
        //If there is an industry near, points will be default to 1.
        return hasIndustry ? 1 : points;
    }

    calculateIndustryPoints(row, col) {
        let points = 1;
    
        // Count industries
        // for (let r = 0; r < this.gridSize; r++) {
        //     for (let c = 0; c < this.gridSize; c++) {
        //         if (this.grid[r][c] === 'I') {
        //             points++;
        //         }
        //     }
        // }
    
        // Generate coins based on adjacent residential buildings
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
    
        directions.forEach(dir => {
            const r = row + dir.dx;
            const c = col + dir.dy;
    
            if (this.isValidCell(r, c) && this.grid[r][c] === 'R') {
                this.coins++;
            }
        });
    
        return points;
    }

    calculateCommercialPoints(row, col) {
        let points = 0;
    
        // Count adjacent commercial buildings
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
    
        directions.forEach(dir => {
            const r = row + dir.dx;
            const c = col + dir.dy;
    
            if (this.isValidCell(r, c) && this.grid[r][c] === 'C') {
                points++;
            }
        });
    
        // Generate coins based on adjacent residential buildings
        directions.forEach(dir => {
            const r = row + dir.dx;
            const c = col + dir.dy;
    
            if (this.isValidCell(r, c) && this.grid[r][c] === 'R') {
                this.coins++;
            }
        });
    
        return points;
    }

    calculateParkPoints(row, col) {
        let points = 0;
    
        // Count adjacent park buildings
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
    
        directions.forEach(dir => {
            const r = row + dir.dx;
            const c = col + dir.dy;
    
            if (this.isValidCell(r, c) && this.grid[r][c] === 'O') {
                points++;
            }
        });
    
        return points;
    }

    calculateRoadPoints(row, col) {
        let points = 0;
    
        // Count connected roads in the same row
        // Might need to change
        for (let c = 0; c < this.gridSize; c++) {
            if (this.grid[row][c] === '*') {
                points++;
            }
        }
    
        return points;
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
    
        // Display game over modal
        const modal = document.getElementById("gameOverModal");
        modal.style.display = "flex";
    }
}
