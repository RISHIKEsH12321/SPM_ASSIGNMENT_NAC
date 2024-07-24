var grids = [];
var points = 0
var turn = 0; 
var buildingCoordinates = []; 


document.addEventListener("DOMContentLoaded", () => {
    const gameState = JSON.parse(sessionStorage.getItem('gameState'));

    if (gameState) {
        points = gameState.points;
        turn = gameState.turn;
        buildingCoordinates = gameState.buildingCoordinates;
        const gridSize = gameState.gridSize;

        // Restore the grid size
        expandGrid(gridSize - 5, buildingCoordinates);

        updateTurnInfo();
        calculatePoints();

        sessionStorage.removeItem('gameState');
    } else {
        getGrids(25); // Initial 5x5 grid
        displayRandomBuildings();
    }

    grids.forEach(grid => {
        grid.addEventListener('dragover', allowDrop);
        grid.addEventListener('drop', drop);
    });

    const saveModal = document.getElementById('saveModal');
    const modalYesButton = document.getElementById('saveYesBtn');
    const modalNoButton = document.getElementById('saveNoBtn');
    const loadModal = document.getElementById('loadModal');
    const loadyesbtn = document.getElementById('loadYesBtn');
    const loadnobtn = document.getElementById('loadNoBtn');
    const infoBtn = document.querySelector("#info-button");

    infoBtn.addEventListener("click", ()=>{
        window.open("../html/about.html", '_blank');
    })

    document.getElementById('saveButton').addEventListener('click', () => {
        saveModal.style.display = 'block';
    });

    modalYesButton.addEventListener('click', () => {
        saveGame();
        saveModal.style.display = 'none';
    });

    modalNoButton.addEventListener('click', () => {
        saveModal.style.display = 'none';
    });

    document.getElementById('loadButton').addEventListener('click', () => {
        loadModal.style.display = 'block';
    });

    loadyesbtn.addEventListener('click', () => {
        loadGame();
        loadModal.style.display = 'none';
    });

    loadnobtn.addEventListener('click', () => {
        loadModal.style.display = 'none';
    });


    window.addEventListener('click', (event) => {
        if (event.target == saveModal) {
            saveModal.style.display = 'none';
        }
        else if (event.target == loadModal) {
            loadModal.style.display = 'none'
        }
    });

    // Show the quit modal when the user tries to quit the game
    document.getElementById('quit-game').addEventListener('click', () => {
        quitModal.style.display = 'block';
    });

    // Handle save before quit
    quitSaveYesBtn.addEventListener('click', async() => {
        try {
            quitModal.style.display = 'none';
            const gameSaved = await saveGame();
            console.log(gameSaved);
            if (gameSaved){
                quitGame();
            }
        } catch (error) {
            console.error('Failed to save data:', error);
            alert("Failed to save game");
        }
    });

    // Handle quit without saving
    quitSaveNoBtn.addEventListener('click', async() => {
        try {
            quitModal.style.display = 'none';
            const gameUpdated = await updateGamesCompleted();
            console.log(gameUpdated);
            if (gameUpdated){
                quitGame();
            }
        } catch (error) {
            console.error('Failed to save data:', error);
            alert("Failed to update number of free play games completed");
        }
    });

    // Handle cancel quit
    quitCancelBtn.addEventListener('click', () => {
        quitModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === quitModal) {
            quitModal.style.display = 'none';
        }
    });
});

const buildings = [
    { type: 'Industrial', src: '../images/Industrial.png' },
    { type: 'Park', src: '../images/Park.png' },
    { type: 'Residential', src: '../images/Residential.png' },
    { type: 'Road', src: '../images/Road.png' },
    { type: 'Commercial', src: '../images/Commercial.png' }
];

function getGrids(gridNo) {
    grids = []; // Clear existing grids array
    for (let i = 0; i < gridNo; i++) {
        grids.push(document.getElementById("cell" + (i + 1)));
    }
}


function displayRandomBuildings() {
    const iconBar = document.getElementById('icon-bar');
    iconBar.innerHTML = ''; // Clear previous icons
    const randomBuildings = getRandomBuildings(2);
    // const randomBuildings = [
    //     {
    //         "type": "Road",
    //         "src": "../images/Road.png"
    //     },
    //     {
    //         "type": "Residential",
    //         "src": "../images/Residential.png"
    //     }
    // ]
    randomBuildings.forEach(building => {
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon');
        const buildingType = document.createElement('p');
        buildingType.style.textAlign="center";
        buildingType.textContent = building.type;
        const img = document.createElement('img');
        img.src = building.src;
        img.alt = building.type;
        img.setAttribute('draggable', 'true');
        img.setAttribute('data-building', building.type);
        img.addEventListener('dragstart', drag);
        iconDiv.appendChild(img);
        iconDiv.appendChild(buildingType);
        iconBar.appendChild(iconDiv);
    });
}

function getRandomBuildings(count) {
    const shuffled = buildings.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.getAttribute('data-building'));
}

function drop(event) {
    event.preventDefault();
    const buildingType = event.dataTransfer.getData("text");
    // console.log(buildingType)
    const cell = event.target;

    if (cell.classList.contains('grid-cell')) {
        const cellId = parseInt(cell.id.replace('cell', ''));
        var gridSize = Math.sqrt(grids.length);
        const row = Math.floor((cellId - 1) / gridSize);
        const col = (cellId - 1) % gridSize;

        // Store the building type and its coordinates
        buildingCoordinates.push({ row, col, type: buildingType });

        cell.setAttribute('data-building', buildingType); // Store the building type in the cell
        var img = document.createElement("img");
        img.classList.add("gridImg");
        img.src =  "../images/"+ buildingType +".png"; 
        img.setAttribute('draggable', 'false'); 
        cell.appendChild(img);

        // Check if we need to expand the grid
        const gridContainer = document.getElementById('grid-container');
        const numCells = gridContainer.querySelectorAll('.grid-cell').length;
        gridSize = Math.sqrt(numCells);

        if (gridSize * gridSize === numCells && isBorderCell(cell, gridSize) && numCells !== 625) {
            expandGrid(gridSize);
        }

        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            removeBuilding(cell, row, col);
        });

        endTurn();
    }
}

function isBorderCell(cell, gridSize) {
    const cellId = parseInt(cell.id.replace('cell', ''));
    const row = Math.floor((cellId - 1) / gridSize);
    const col = (cellId - 1) % gridSize;
    return (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1);
}


function expandGrid(currentGridSize) {
    const gridContainer = document.getElementById('grid-container');
    const newGridSize = currentGridSize + 5;

    // Clear existing cells to avoid duplication
    gridContainer.innerHTML = '';

    for (let i = 0; i < newGridSize; i++) {
        for (let j = 0; j < newGridSize; j++) {
            const cellId = i * newGridSize + j + 1;
            const newCell = document.createElement('div');
            newCell.classList.add('grid-cell');
            newCell.id = `cell${cellId}`;
            gridContainer.appendChild(newCell);

            // Reattach event listeners to new grid cell
            newCell.addEventListener('dragover', allowDrop);
            newCell.addEventListener('drop', drop);
            
            // Check if there's a building at this cell and display it
            const existingBuilding = buildingCoordinates.find(building => building.row === i && building.col === j);
            if (existingBuilding) {
                const img = document.createElement("img");
                img.classList.add("gridImg");
                img.src = "../images/" + existingBuilding.type + ".png";
                img.setAttribute('draggable', 'false');
                newCell.appendChild(img);
                newCell.setAttribute('data-building', existingBuilding.type);
                
                // Reattach context menu listener for existing buildings
                newCell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    removeBuilding(newCell, i, j);
                });
            }
        }
    }
    
    gridContainer.style.gridTemplateColumns = `repeat(${newGridSize},  minmax(25px,1fr))`;
    getGrids(newGridSize * newGridSize);

    calculatePoints();
}


function startTurn() {
    calculatePoints();
    turn++;
    displayRandomBuildings();
    updateTurnInfo();
}

function endTurn() {

    startTurn();
}

function updateTurnInfo() {
    document.getElementById('turn').textContent = `Turn ${turn}`;
}

function calculatePoints() {
    let newPoints = 0;
    let industries = 0;
    // console.log("calculatePoints");
    grids.forEach(grid => {
        const buildingType = grid.getAttribute('data-building');
        if (buildingType) {
            switch (buildingType) {
                case 'Residential':
                    newPoints += calculateResidentialPoints(grid);
                    break;
                case 'Industrial':
                    newPoints += 1;
                    industries++;
                    break;
                case 'Commercial':
                    newPoints += calculateCommercialPoints(grid);
                    break;
                case 'Park':
                    newPoints += calculateParkPoints(grid);
                    break;
                case 'Road':
                    newPoints += calculateRoadPoints(grid);
                    break;
            }
        }
    });


    points = newPoints;
    document.querySelector('.header-info .info-box:first-child').textContent = `Points: ${points}`;
}

function calculateResidentialPoints(cell) {
    let points = 0;
    const adjacentBuildings = getAdjacentBuildings(cell);

    if (adjacentBuildings.includes('Industrial')) {
        points = 1; // Only 1 point if adjacent to an industry
    } else {
        adjacentBuildings.forEach(type => {
            switch (type) {
                case 'Residential':
                    points += 1;
                    break;
                case 'Commercial':
                    points += 1;
                    break;
                case 'Park':
                    points += 2;
                    break;
            }
        });
    }

    return points;
}

function calculateCommercialPoints(cell) {
    return countAdjacentBuildings(cell, 'Commercial');
}

function calculateParkPoints(cell) {
    return countAdjacentBuildings(cell, 'Park');
}



function calculateRoadPoints(grid) {
    let roadPoints = 0;
    const gridSize = Math.sqrt(grids.length); // Assuming grids is the array of grid elements
    
    // Get the cell ID from the grid element
    const cellId = grid.id.match(/\d+/)[0];
    const gridNo = parseInt(cellId, 10);

    // Calculate row and column number based on grid number
    const row = Math.floor((gridNo - 1) / gridSize);
    const col = (gridNo - 1) % gridSize;
    // console.log(`gridSize: ${gridSize}\nRow: ${row}\nCol: ${col} `);
    if (grid.getAttribute('data-building') === 'Road') {
        // Check right and left
        let roadLength = 1;

        // Check right
        for (let i = col + 1; i < gridSize; i++) {
            let rightIndex = row * gridSize + i;
            // console.log(rightIndex)
            if (grids[rightIndex].getAttribute('data-building') === 'Road') {
                roadLength++;
            } else {
                break;
            }
        }

        // Check left
        for (let i = col - 1; i >= 0; i--) {
            let leftIndex = row * gridSize + i;
            if (grids[leftIndex].getAttribute('data-building') === 'Road') {
                roadLength++;
            } else {
                break;
            }
        }

        // Add points based on road length
        roadPoints += roadLength - 1;
    }

    return roadPoints;
}

function checkRoadConfiguration(currentRow, pattern) {
    const gridSize = currentRow.length;

    for (let i = 0; i < gridSize; i++) {
        if (currentRow[i] !== pattern[i]) {
            return false;
        }
    }

    return true;
}

function getAdjacentBuildings(cell) {
    const cellId = cell.id.match(/\d+/)[0];
    const gridNo = parseInt(cellId, 10);
    const gridSize = Math.sqrt(grids.length); // Assuming grids is the array of grid elements

    // Calculate row and column number based on grid number
    const row = Math.floor((gridNo - 1) / gridSize);
    const col = (gridNo - 1) % gridSize;

    const adjacentCells = [];

    // Check the right cell
    if (col < gridSize - 1) {
        adjacentCells.push(document.getElementById(`cell${gridNo + 1}`));
    }
    // Check the left cell
    if (col > 0) {
        adjacentCells.push(document.getElementById(`cell${gridNo - 1}`));
    }
    // Check the cell above
    if (row > 0) {
        adjacentCells.push(document.getElementById(`cell${gridNo - gridSize}`));
    }
    // Check the cell below
    if (row < gridSize - 1) {
        adjacentCells.push(document.getElementById(`cell${gridNo + gridSize}`));
    }
    return adjacentCells
        .filter(adjCell => adjCell && adjCell.getAttribute('data-building'))
        .map(adjCell => adjCell.getAttribute('data-building'));
}

function countAdjacentBuildings(cell, type) {
    return getAdjacentBuildings(cell).filter(buildingType => buildingType === type).length;
}


async function saveGame() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userid = currentUser._id;
    const freePlayGamesCompleted = parseInt(currentUser['free-play-games-completed']) + 1;

    const gameData = {
        points: points,
        turn: turn,
        buildingCoordinates: buildingCoordinates,
        gridSize: Math.sqrt(grids.length)
    };

    try {
        const response = await fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({ 'freeplay-save': gameData, 'free-play-games-completed': freePlayGamesCompleted }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Game saved:', data);
            currentUser['free-play-games-completed'] = freePlayGamesCompleted;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Game saved successfully');
            return true;
        } else {
            console.error('Failed to save game: Network response was not ok.');
            alert('Failed to save game');
            return false;
        }
    } catch (error) {
        console.error('Error saving game:', error);
        alert('Failed to save game');
        return false;
    }
}

async function updateGamesCompleted(){
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = currentUser._id
    const freePlayGamesCompleted = parseInt(currentUser['free-play-games-completed']) + 1;

    try {
        const response = await fetch(`https://spmassignment-a329.restdb.io/rest/player/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '6667013f85f7f679ab63cd2a',
                'cache-control': 'no-cache'
            },
            body: JSON.stringify({ 'free-play-games-completed': freePlayGamesCompleted }),
        });

        if (!response.ok) {
            throw new Error('Failed to update arcade games completed');
        }
        currentUser['free-play-games-completed'] = freePlayGamesCompleted;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('Update arcade games completed successfully');
        return true;
    } catch (error) {
        console.error('Error updating arcade games completed:', error);
        return false;
    }
}

function loadGame() {
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
        
        // Restore game state
        const gameState = data['freeplay-save']; // Access the correct property name here

        points = gameState.points;
        turn = gameState.turn;
        buildingCoordinates = gameState.buildingCoordinates;
        const gridSize = gameState.gridSize;

        // Restore the grid size
        expandGrid(gridSize - 5, buildingCoordinates);

        updateTurnInfo();
        // Recalculate points
        calculatePoints();
        
        alert('Game loaded successfully');
    })
    .catch(error => {
        console.error('Error loading game state:', error);
        alert('Failed to load game');
    });
}

function quitGame() {
    console.log('Quitting game...');
    // Implement your actual quit game logic here
    window.location.href = "../index.html";
}


// function removeBuilding(cell, row, col) {
//     // Remove the building visually
//     cell.innerHTML = ''; // Clear the cell content
//     cell.removeAttribute('data-building');

//     // Remove from buildingCoordinates array
//     buildingCoordinates = buildingCoordinates.filter(building => !(building.row === row && building.col === col));

//     // Recalculate points or update any necessary state
//     calculatePoints();
// }


function removeBuilding(cell, row, col) {
    // Create the modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    const modal = document.createElement('div');
    modal.classList.add('demolishmodal');
    modal.innerHTML = `
        <div class="demolishmodal-content">
            <p>Are you sure you want to delete this building?</p>
            <button id="confirmDeleteBtn">Yes</button>
            <button id="cancelDeleteBtn">No</button>
        </div>
    `;

    // Append modal to the body
    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);

    // Handle modal buttons
    const confirmDeleteBtn = modal.querySelector('#confirmDeleteBtn');
    const cancelDeleteBtn = modal.querySelector('#cancelDeleteBtn');

    // Handle deletion confirmation
    confirmDeleteBtn.addEventListener('click', () => {
        // Remove the building visually
        cell.innerHTML = ''; // Clear the cell content
        cell.removeAttribute('data-building');

        // Remove from buildingCoordinates array
        buildingCoordinates = buildingCoordinates.filter(building => !(building.row === row && building.col === col));

        // Recalculate points or update any necessary state
        calculatePoints();

        // Remove modal
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modal);
    });

    // Handle cancellation
    cancelDeleteBtn.addEventListener('click', () => {
        // Remove modal
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modal);
    });

    // Handle click outside modal to close
    modalOverlay.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        document.body.removeChild(modal);
    });

    // Prevent clicks from closing modal when clicking on modal itself
    modal.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

