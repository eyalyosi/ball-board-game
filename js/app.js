const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var ballAudio = new Audio("img/pop.mp3")
var GLUE_IMG = '<img src="img/candy.png" />'

var gBoard
var gGamerPos
var gBallCollected
var gBallsCounter
var gBallIntervall
var isGameOver
var gAddGlueInterval
var isGlued
var gGlueTimerID
var gIsGluedTimerID
// var gGluePos

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gBallsCounter = 2
	gBallCollected = 0
	gBallIntervall = setInterval(addBall, 5000)
	gAddGlueInterval = setInterval(addGlue, 5000)
	isGlued = false
	isGameOver = false

}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	board[0][5].type = FLOOR
	board[5][0].type = FLOOR
	board[9][5].type = FLOOR
	board[5][11].type = FLOOR

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			//change to short if statement
			cellClass += (currCell.type === FLOOR) ? ' floor' : (currCell.type === WALL) ? ' wall' : ''

			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';

			//Change To template string ${}
			strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >`;
			//change to switch case statement
			switch (currCell.gameElement) {
				case 'GAMER':
					strHTML += GAMER_IMG
					break
				case 'BALL':
					strHTML += BALL_IMG;
					break
			}
			strHTML += '</td>';
		}
		strHTML += '</tr>';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (isGameOver) return
	if (isGlued) return

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);


	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(jAbsDiff === 11 && iAbsDiff === 0) ||
		(jAbsDiff === 0 && iAbsDiff === 9)) {

		if (targetCell.gameElement === BALL) {
			collectBall()
		}
		if (targetCell.gameElement === GLUE) {
			collectGlue()
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} //else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

function addBall() {
	var pos = getRandomEmptyCell()
	if (!pos) return;

	gBoard[pos.i][pos.j].gameElement = BALL;
	renderCell(pos, BALL_IMG);
	gBallsCounter++
}

function collectBall() {
	// collectBallSound()
	//update Model
	gBallCollected++
	//update dom
	renderBallCollected(gBallCollected)
	checkGameOver()
}

function renderBallCollected(num) {
	var elBallsCollected = document.querySelector('h2 span')
	elBallsCollected.innerText = num
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

function addGlue() {
	var pos = getRandomEmptyCell()
	if (!pos) return

	gBoard[pos.i][pos.j].gameElement = GLUE
	renderCell(pos, GLUE_IMG)
	gGlueTimerID = setTimeout(() => removeGlue(pos), 3000)
	/*
		gGluePos = pos
		gGlueTimerID = setTimeout(removeGlue, 3000)
	*/
}

function removeGlue(pos) {
	gBoard[pos.i][pos.j].gameElement = null
	renderCell(pos, '')

	/*
	gBoard[gGluePos.i][gGluePos.j].gameElement = null
	renderCell(gGluePos, '')
	gGluePos = null
	*/
}

function collectGlue() {
	isGlued = true
	clearTimeout(gGlueTimerID)
	gIsGluedTimerID = setTimeout(turnOffGlued, 3000)
}

function turnOffGlued() {
	if (isGlued) {
		isGlued = false
	}
}

function checkGameOver() {
	if (gBallsCounter === gBallCollected) {
		elBtn = document.querySelector('.reset')
		elBtn.classList.remove('hide')
		clearInterval(gBallIntervall)
		clearInterval(gAddGlueInterval)
		isGameOver = true
		clearTimeout(gGlueTimerID)
		clearTimeout(gIsGluedTimerID)
		//gGluePos = null
		var elModal = document.querySelector('.modal')
		elModal.classList.remove('modal-hide')
	}
}

function restartGame(elBtn) {
	initGame()
	elBtn.classList.add('hide')
	var elModal = document.querySelector('.modal')
	elModal.classList.add('modal-hide')
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) {
				moveTo(i, gBoard[0].length - 1)
			} else {
				moveTo(i, j - 1);
			}
			break;
		case 'ArrowRight':
			if (j === gBoard[0].length - 1) {
				moveTo(i, 0)
			} else {
				moveTo(i, j + 1);
			}
			break;
		case 'ArrowUp':
			if (i === 0) {
				moveTo(gBoard.length - 1, j)
			} else {
				moveTo(i - 1, j);
			}
			break;
		case 'ArrowDown':
			if (i === gBoard.length - 1) {
				moveTo(0, j)
			} else {
				moveTo(i + 1, j);
			}
			break;
	}
}

function getRandomEmptyCell() {
	var emptyPos = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j]
			if (cell.type === FLOOR && !cell.gameElement) {
				emptyPos.push({ i: i, j: j });
			}
		}
	}
	if (emptyPos.length) return emptyPos[getRandomInt(0, emptyPos.length - 1)];
	return null
}

function collectBallSound() {
	var audio = ballAudio;
	audio.play();
}