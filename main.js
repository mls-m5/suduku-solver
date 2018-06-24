

function byId(id) {
	return document.getElementById(id);
}


var canvas = byId("canvas");
var ctx = canvas.getContext("2d");
var info = byId("info");


var boardSize = canvas.height;
var cellSize = boardSize / 9;

function Cell(board, x, y) {
	this.possibleNumbers = [];
	this.uniqueNumbers = [];

	this.board = board;
	this.x = x;
	this.y = y;

	this.number = null;

	this.setNumber = function(number) {
		this.number = number;
	}

	this.resetPossibleNumbers = function() {
		this.possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		if (this.number !== null) {
			this.possibleNumbers = [];
		}
	}

	this.recalculate = function() {
		let qx = Math.floor(this.x / 3) * 3;
		let qy = Math.floor(this.y / 3) * 3;

		this.uniqueNumbers = [];

		for (let i = 1; i <= 9; ++i) {
			if (this.possibleNumbers.indexOf(i) === -1) {
				continue; //No idea to try the number
			}
			let isUnique = true;
			for (let ix = qx; ix < qx + 3; ++ix) for (let iy = qy; iy < qy + 3; ++iy) {
				if (ix === this.x && iy === this.y) {
					continue;
				}
				let cell = this.board.getCell(ix, iy);
				if (cell.possibleNumbers.indexOf(i) > -1) {
					isUnique = false;
				}
				if (cell.number == i) {
					isUnique = false;
				}
			}
			if (isUnique) {
				if (this.uniqueNumbers.indexOf(i) === -1) {
					this.uniqueNumbers.push(i);
				}
			}
		}
	}

	this.resetPossibleNumbers();

	this.removeNumber = function(number) {
		var index = this.possibleNumbers.indexOf(number);
		if (index > -1) {
			this.possibleNumbers.splice(index, 1);
		}
	}

	this.render = function() {
		let dx = this.x * cellSize;
		let dy = this.y * cellSize;
		//drawText(this.x * cellSize, this.y * cellSize, "hej");

		for (let i = 1; i <= 9; ++i) {
			let nx = ((i - 1) % 3 + .5) * cellSize / 4 ;
			let ny = (Math.floor((i - 1) / 3) + .5) * cellSize / 4;
			if (this.possibleNumbers.indexOf(i) > -1) {
				var isUnique = false;
				if (this.uniqueNumbers.indexOf(i) > -1) {
					ctx.fillStyle = "red";
					isUnique = true;
				}
				if (this.uniqueNumbers.length > 0 && isUnique) {
					drawText(dx + nx, dy + ny, "" + i, 10 + 2 * isUnique);
				}
				else if (this.uniqueNumbers.length == 0) {
					drawText(dx + nx, dy + ny, "" + i, 10 );
				}
				ctx.fillStyle = "black";
			}
		}

		if (this.number !== null) {
			drawText(dx + cellSize / 4, dy, "" + this.number, 50);
		}
	};
}

function Board() {
	this.cells = [];

	for (var y = 0; y < 9; ++y) for (var x = 0; x < 9; ++x)  {
		this.cells.push(new Cell(this, x, y));
	}

	this.getCell = function(x, y) {
		return this.cells[y * 9 + x];
	}

	this.recalculate = function() {
		for (let i in this.cells) {
			this.cells[i].resetPossibleNumbers();
		}

		for (let i in this.cells) {
			var cell = this.cells[i];
			this.removeNumberFromX(cell.x, cell.number);
			this.removeNumberFromY(cell.y, cell.number);
			this.removeNumberFromQuadrant(cell.x, cell.y, cell.number);
		}

		for (let i in this.cells) {
			this.cells[i].recalculate();
		}

		this.render();
	}

	this.removeNumberFromX = function(x, number) {
		for (let y = 0; y < 9; ++y) {
			var cell = this.getCell(x, y);
			cell.removeNumber(number);
		}
	}

	this.removeNumberFromY = function(y, number) {
		for (let x = 0; x < 9; ++x) {
			var cell = this.getCell(x, y);
			cell.removeNumber(number);
		}
	}

	this.removeNumberFromQuadrant = function(x, y, number) {
		let tx = Math.floor(x / 3) * 3;
		let ty = Math.floor(y / 3) * 3;

		let numberRange = [];
		if (number === null) {
			return;
		}
		else if (typeof number === "undefined") {
			numberRange = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		}
		else {
			numberRange = [number];
		}

		for (let i in numberRange) {
			let n = numberRange[i];
			for (let ix = tx; ix < tx + 3; ++ix) for (let iy = ty; iy < ty + 3; ++iy) {
				var cell = this.getCell(ix, iy);
				cell.removeNumber(n);
			}
		}
	}

	this.render = function() {
		clearScreen();
		for (let i = 0; i < 10; ++i) {
			if (i % 3 == 0) {
				ctx.lineWidth = 3;
			}
			else {
				ctx.lineWidth = 1;
			}
			drawLine(cellSize * i, 0, cellSize * i, boardSize);
			drawLine(0, cellSize * i, boardSize, cellSize * i);

		}

		for (let i in this.cells) {
			this.cells[i].render();
		}
	}

	this.clear = function() {
		for (let i in this.cells) {
			this.cells[i].number = null;
		}
		this.recalculate();
	}

	this.setCellNumber = function (x, y, number) {
		var cell = this.getCell(x, y);
		cell.setNumber(number);
		this.recalculate();
		this.render();
	}

	this.save = function(stateNum) {
		if (typeof stateNum === "undefined") {
			stateNum = 0;
		}
		var output = [];
		for (let i in this.cells) {
			output.push(this.cells[i].number);
		}

		localStorage.setItem("state" + stateNum, JSON.stringify(output));
	}

	this.load = function(stateNum) {
		if (typeof stateNum === "undefined") {
			stateNum = 0;
		}
		var data = JSON.parse(localStorage.getItem("state" + stateNum));
		for (let i in this.cells) {
			this.cells[i].setNumber(data[i]);
		}
		this.recalculate();
	}

	this.autoFill = function() {
		var breakLoop = false;

		while (!breakLoop) {
			breakLoop = true;

			for (let i in this.cells) {
				let cell = this.cells[i];
				if (cell.uniqueNumbers.length == 1) {
					cell.setNumber(cell.uniqueNumbers[0]);
					breakLoop = false;
					this.recalculate();
					break;
				}
				if (cell.possibleNumbers.length == 1) {
					cell.setNumber(cell.possibleNumbers[0]);
					breakLoop = false;
					this.recalculate();
					break;
				}
				else if (cell.number == null && cell.possibleNumbers.length == 0) {
					info.innerText = "Sudukut går ej att lösa på det här sättet";
					this.recalculate();
					return;
				}
			}
		}
	}
}

function drawLine(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
}

function clearScreen() {
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,boardSize, boardSize);
	ctx.fillStyle = "black";
}

function drawText(x, y, text, textSize, bold) {
	if (typeof textSize === "undefined") {

		ctx.font = "10px sans";

		ctx.fillText(text, x, y + 20);
	}
	else {
		ctx.font = textSize + "px sans"

		ctx.fillText(text, x, y + textSize);
	}
}


//From https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return {x: x, y: y};
    //console.log("x: " + x + " y: " + y);
}

canvas.addEventListener("click", function(event) {
	var coords = getCursorPosition(canvas, event);
	console.log(coords);

	var x = Math.floor(coords.x / cellSize);
	var y = Math.floor(coords.y / cellSize);

	var number = prompt("ge ett nummer");

	if (number !== null) {
		number = number-0;
	}

	board.setCellNumber(x, y, number);

	board.render();
});


var board = new Board();

board.render();


function keyPress(e){
	var keynum;

    if(window.event) { // IE                    
    	keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera                   
    	keynum = e.which;
    }

    char = String.fromCharCode(keynum);

    if (char == "l") {
    	let input = prompt("ange nummer");
    	if (input === null) {
    		return;
    	}
    	board.load(input - 0);
    }
    else if (char == "s") {
    	let input = prompt("ange nummer");
    	if (input === null) {
    		return;
    	}
    	board.save(input - 0);
    }
    else if (char == "c") {
    	board.clear();
    }
    else if (char == "a") {
    	board.autoFill();
    }
}

window.addEventListener("keypress", keyPress, true);

board.load();
