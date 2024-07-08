var grids = [];
var points = 0
var turn = 0;
var buildingCoordinates = []; 


document.addEventListener("DOMContentLoaded", () => {
    getGrids(25); // Initial 5x5 grid
    displayRandomBuildings();

    grids.forEach(grid => {
        grid.addEventListener('dragover', allowDrop);
        grid.addEventListener('drop', drop);
    });
});

const buildings = [
    { type: 'Industrial', src: '../images/Industrial.png' },
    { type: 'Park', src: '../images/Park.png' },
    { type: 'Residential', src: '../images/Residential.png' },
    { type: 'Road', src: '../images/Road.png' },
    { type: 'Commercial', src: '../images/Commercial.png' }
];

// function getGrids(gridNo) {
//     for (let i = 0; i < gridNo; i++) {
//         grids.push(document.getElementById("cell" + (i + 1)));
//     }
// }

function getGrids(gridNo) {
    grids = []; // Clear existing grids array
    for (let i = 0; i < gridNo; i++) {
        grids.push(document.getElementById("cell" + (i + 1)));
    }
}


function displayRandomBuildings() {
    const iconBar = document.getElementById('icon-bar');
    iconBar.innerHTML = ''; // Clear previous icons
    // const randomBuildings = getRandomBuildings(2);
    const randomBuildings = [
        {
            "type": "Commercial",
            "src": "../images/Commercial.png"
        },
        {
            "type": "Residential",
            "src": "../images/Residential.png"
        }
    ]
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

//Original
// function drop(event) {
//     event.preventDefault();
//     const buildingType = event.dataTransfer.getData("text");
//     const cell = event.target;
//     if (cell.classList.contains('grid-cell')) {
//         cell.setAttribute('data-building', buildingType); // Store the building type in the cell
//         var img = document.createElement("img");
//         img.classList.add("gridImg");
//         img.src =  "../images/"+ buildingType +".png"; 
//         img.setAttribute('draggable', 'false'); 
//         cell.appendChild(img);
//         endTurn();
//     }
// }

// Wokring expand
function drop(event) {
    event.preventDefault();
    const buildingType = event.dataTransfer.getData("text");
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

        if (gridSize * gridSize === numCells && isBorderCell(cell, gridSize) && numCells !== 10000) {
            expandGrid(gridSize);
        }
        endTurn();
    }
}

function isBorderCell(cell, gridSize) {
    const cellId = parseInt(cell.id.replace('cell', ''));
    const row = Math.floor((cellId - 1) / gridSize);
    const col = (cellId - 1) % gridSize;
    console.log(true);
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
        }
    });
}


// function drop(event) {
//     event.preventDefault();
//     const buildingType = event.dataTransfer.getData("text");
//     const cell = event.target;

//     if (cell.classList.contains('grid-cell')) {
//         const cellId = parseInt(cell.id.replace('cell', ''));
//         const numCells = document.querySelectorAll('.grid-cell').length;

//         if (isOnBorder(cellId, numCells)) {
//             expandGrid();
//         }

//         cell.setAttribute('data-building', buildingType); // Store the building type in the cell
//         var img = document.createElement("img");
//         img.classList.add("gridImg");
//         img.src = `../images/${buildingType}.png`;
//         img.setAttribute('draggable', 'false');
//         cell.appendChild(img);
//         endTurn();
//     }
// }

// function isOnBorder(cellId, numCells) {
//     const numRows = Math.ceil(Math.sqrt(numCells));
//     const row = Math.floor((cellId - 1) / numRows);
//     const col = (cellId - 1) % numRows;

//     // Check if cell is on the border (last row or column)
//     if (row === numRows - 1 || col === numRows - 1) {
//         return true;
//     }

//     return false;
// }

// function expandGrid() {
//     const gridContainer = document.getElementById('grid-container');
//     const currentNumCells = gridContainer.querySelectorAll('.grid-cell').length;
//     const newCells = 25; // Increase by another 5x5 grid

//     for (let i = currentNumCells + 1; i <= currentNumCells + newCells; i++) {
//         const newCell = document.createElement('div');
//         newCell.classList.add('grid-cell');
//         newCell.id = `cell${i}`;
//         gridContainer.appendChild(newCell);

//         // Add event listeners to new grid cell
//         newCell.addEventListener('dragover', allowDrop);
//         newCell.addEventListener('drop', drop);
//     }

//     // Calculate new number of columns and rows dynamically
//     const numRows = Math.ceil(Math.sqrt(currentNumCells + newCells));
//     const numColumns = Math.ceil((currentNumCells + newCells) / numRows);

//     // Update CSS grid-template-columns and grid-auto-rows properties
//     gridContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
//     gridContainer.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

//     getGrids(currentNumCells + newCells); // Update grids array with new cells
// }


function startTurn() {
    turn++;
    displayRandomBuildings();
    updateTurnInfo();
}

function endTurn() {
    calculatePoints();
    startTurn();
}

function updateTurnInfo() {
    document.getElementById('turn').textContent = `Turn ${turn}`;
}

function calculatePoints() {
    let newPoints = 0;
    let industries = 0;

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

function calculateRoadPoints() {
    let roadPoints = 0;

    for (let row = 0; row < 5; row++) { // Assuming a 5x5 grid for initial implementation
        let rowStart = row * 5;
        let currentRow = [];

        for (let col = 0; col < 5; col++) {
            let currentIndex = rowStart + col;
            currentRow.push(grids[currentIndex].getAttribute('data-building') === 'Road');
        }
        console.log("row: "+ row)
        if (currentRow[0] && currentRow[1] && !currentRow[2] && !currentRow[3] && !currentRow[4]) {
            roadPoints++;
            console.log(1);
        } else if (!currentRow[0] && currentRow[1] && currentRow[2] && !currentRow[3] && !currentRow[4]) {
            roadPoints++;
            console.log(2);
        } else if (!currentRow[0] && !currentRow[1] && currentRow[2] && currentRow[3] && !currentRow[4]) {
            roadPoints++;
            console.log(3);
        } else if (!currentRow[0] && !currentRow[1] && !currentRow[2] && currentRow[3] && currentRow[4]) {
            roadPoints++;
            console.log(4);
        } else if (currentRow[0] && currentRow[1] && currentRow[2] && !currentRow[3] && !currentRow[4]) {
            roadPoints += 2;
            console.log(5);
        } else if (!currentRow[0] && currentRow[1] && currentRow[2] && currentRow[3] && !currentRow[4]) {
            roadPoints += 2;
            console.log(6);
        } else if (!currentRow[0] && !currentRow[1] && currentRow[2] && currentRow[3] && currentRow[4]) {
            roadPoints += 2;
            console.log(7);
        } else if (currentRow[0] && currentRow[1] && currentRow[2] && currentRow[3] && !currentRow[4]) {
            roadPoints += 3;
            console.log(8);
        } else if (!currentRow[0] && currentRow[1] && currentRow[2] && currentRow[3] && currentRow[4]) {
            roadPoints += 3;
            console.log(9);
        } else if (currentRow[0] && currentRow[1] && currentRow[2] && currentRow[3] && currentRow[4]) {
            roadPoints += 4;
            console.log(10);
        }
    
    }

    return roadPoints;
}




function getAdjacentBuildings(cell) {
    const cellId = cell.id.match(/\d+/)[0];
    const gridNo = parseInt(cellId, 10);

    // Calculate row and column number based on grid number (assuming a 5x5 grid)
    const row = Math.floor((gridNo - 1) / 5);
    const col = (gridNo - 1) % 5;

    const adjacentCells = [];

    // Check the right cell
    if (col < 4) {
        adjacentCells.push(document.getElementById(`cell${gridNo + 1}`));
    }
    // Check the left cell
    if (col > 0) {
        adjacentCells.push(document.getElementById(`cell${gridNo - 1}`));
    }
    // Check the cell above
    if (row > 0) {
        adjacentCells.push(document.getElementById(`cell${gridNo - 5}`));
    }
    // Check the cell below
    if (row < 4) {
        adjacentCells.push(document.getElementById(`cell${gridNo + 5}`));
    }

    return adjacentCells
        .filter(adjCell => adjCell && adjCell.getAttribute('data-building'))
        .map(adjCell => adjCell.getAttribute('data-building'));
}


function countAdjacentBuildings(cell, type) {
    return getAdjacentBuildings(cell).filter(buildingType => buildingType === type).length;
}
