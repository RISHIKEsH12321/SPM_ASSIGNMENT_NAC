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
        expandGrid(gridSize - 5);

        // Restore buildings
        buildingCoordinates.forEach(({ row, col, type }) => {
            const cellId = row * gridSize + col + 1;
            const cell = document.getElementById(`cell${cellId}`);
            if (cell) {
                var img = document.createElement("img");
                img.classList.add("gridImg");
                img.src = "../images/" + type + ".png";
                img.setAttribute('draggable', 'false');
                cell.appendChild(img);
                cell.setAttribute('data-building', type);
            }
        });
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
    while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    
    for (let i = 0; i < newGridSize; i++) {
        for (let j = 0; j < newGridSize; j++) {
            const cellId = i * newGridSize + j + 1;
            const newCell = document.createElement('div');
            newCell.classList.add('grid-cell');
            newCell.id = `cell${cellId}`;
            gridContainer.appendChild(newCell);
            
            // Add event listeners to new grid cell
            newCell.addEventListener('dragover', allowDrop);
            newCell.addEventListener('drop', drop);
        }
    }
    
    gridContainer.style.gridTemplateColumns = `repeat(${newGridSize}, 1fr)`;
    getGrids(newGridSize * newGridSize);

    // Reassign buildings to their correct cells based on stored coordinates
    buildingCoordinates.forEach(({ row, col, type }) => {
        const cellId = row * newGridSize + col + 1;
        const cell = document.getElementById(`cell${cellId}`);
        if (cell) {
            var img = document.createElement("img");
            img.classList.add("gridImg");
            img.src = "../images/" + type + ".png";
            img.setAttribute('draggable', 'false');
            cell.appendChild(img);
            cell.setAttribute('data-building', type);
        }
    });
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


function saveGame() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userid = currentUser._id;

    const gameData = {
        points: points,
        turn: turn,
        buildingCoordinates: buildingCoordinates,
        gridSize: Math.sqrt(grids.length)
    };

    fetch(`https://spmassignment-a329.restdb.io/rest/player/${userid}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': '6667013f85f7f679ab63cd2a',
            'cache-control': 'no-cache'
        },
        body: JSON.stringify({ 'freeplay-save': gameData }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Game saved:', data);
        alert('Game saved successfully')
    })
    .catch(error => {
        console.error('Error saving game:', error);
    });
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
        expandGrid(gridSize - 5);

        // Restore buildings
        buildingCoordinates.forEach(({ row, col, type }) => {
            const cellId = row * gridSize + col + 1;
            const cell = document.getElementById(`cell${cellId}`);
            if (cell) {
                var img = document.createElement("img");
                img.classList.add("gridImg");
                img.src = "../images/" + type + ".png";
                img.setAttribute('draggable', 'false');
                cell.appendChild(img);
                cell.setAttribute('data-building', type);
            }
        });
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
