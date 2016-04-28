let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload,
		create
	}
)

let socket;
let player;
let tilesList = [];
let tilesLib = [];
let usedTiles = [];
let lines = [];

let win;
let lose;

function preload () {
	game.load.image('grid', 'assets/grid.jpg');
	game.load.image('xMark', 'assets/xMark.jpg');
	game.load.image('oMark', 'assets/oMark.jpg');
	game.load.image('vLine', 'assets/vLine.jpg');
	game.load.image('hLine', 'assets/hLine.jpg');
	game.load.image('rDiag', 'assets/rDiag.jpg');
	game.load.image('lDiag', 'assets/lDiag.jpg');

	game.load.image('win', 'assets/win.jpg');
	game.load.image('lose', 'assets/lose.jpg');
}

function create () {
	socket = io.connect();
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	let coordMap = window.buildCoordinates;

	for (let key in coordMap) {
		let tile = new Phaser.Rectangle(coordMap[key].x, coordMap[key].y, 125, 125);
		tilesList.push({
			tile,
			coord: key
		});
	}

	setEventHandlers();

	setSocketHandlers();
}

let setEventHandlers = () => {
	game.input.onDown.add((pointer) => {
		if (player.turn){
			for (let key in tilesList) {
				if (tilesList[key].tile.contains(pointer.x,pointer.y) && usedTiles.indexOf(tilesList[key].tile) < 0 ) {
					let markSprite = game.add.sprite(tilesList[key].tile.x+window.offsets[player.mark+'OFFSET'], tilesList[key].tile.y+window.offsets[player.mark+'OFFSET'], player.mark+'Mark');
					player.turn = false;
					usedTiles.push(tilesList[key].tile);
					tilesLib.push({
						usedTile: tilesList[key].tile,
						coord: tilesList[key].coord,
						mark: player.mark,
						markSprite
					});
					socket.emit('turn player', {key, mark: player.mark});
				}
			}
		}
	});
}

let setSocketHandlers = () => {
  	socket.on('connect', () => {
  		console.log('Connected to socket server');

  		socket.emit('new player');
  	});

  	socket.on('new player', (data) => {
  		if (!player) {
  			console.log('Player connected:', data.id);
  		}
  		player = data;
  		if (!player.turn) {
  			console.log('Waiting for opponent player...');
  		} else {
  			console.log('A new challenger has arrived');
  		}
	});

	socket.on('turn player', (data) => {
		if (tilesList) {
			let markSprite = game.add.sprite(tilesList[data.key].tile.x+window.offsets[data.mark+'OFFSET'], tilesList[data.key].tile.y+window.offsets[data.mark+'OFFSET'], data.mark+'Mark');
			player.turn = true;
			usedTiles.push(tilesList[data.key].tile);
			tilesLib.push({
				usedTile: tilesList[data.key].tile,
				coord: tilesList[data.key].coord,
				mark: data.mark,
				markSprite
			});
			checkForWin();
		}
	});

	socket.on('clear game', () => {
		player.turn = false;
		for (let tile in tilesLib) {
			tilesLib[tile].markSprite.kill();
		}
		if (lines && lines instanceof Array) {
			lines.forEach((line) => line.kill());
		}
		if (win) {
			win.kill();
		}
		if (lose) {
			lose.kill();
		}

		tilesLib = [];
		usedTiles = [];
		lines = [];
	});

	socket.on('end game', (data) => {
		renderLine(data.line);

		function renderLine(line) {
			if (line.indexOf('row') > -1) {
				let index = line[3];
				player.turn = false;
				lines.push(game.add.sprite(0, window.offsets['lineOFFSET'+index], 'hLine'));
			}
			if (line.indexOf('col') > -1) {
				let index = line[3];
				player.turn = false;
				lines.push(game.add.sprite(window.offsets['lineOFFSET'+index], 0, 'vLine'));
			}
			if (line === 'lDiag') {
				player.turn = false;
				lines.push(game.add.sprite(0, 0, 'lDiag'));
			}
			if (line === 'rDiag') {
				player.turn = false;
				lines.push(game.add.sprite(0, window.offsets.diagOFFSET, 'rDiag'));
			}
		}
	});

	socket.on('winner', () => {
		win = game.add.sprite(100, 100, 'win');
	});

	socket.on('loser', () => {
		lose = game.add.sprite(100, 100, 'lose');
	});
}

let checkForWin = () => {
	let colList = ['col1', 'col2', 'col3'];
	let rowList = ['row1', 'row2', 'row3'];
	let diagonal1 = ['row1col1', 'row2col2', 'row3col3'];
	let diagonal2 = ['row3col1', 'row2col2', 'row1col3'];

	if (checkDiagonalWin(diagonal1)) {
		console.log('You win!');
		socket.emit('end game', {line: 'lDiag'});
	}
	if (checkDiagonalWin(diagonal2)) {
		console.log('You win!');
		socket.emit('end game', {line: 'rDiag'});
	}
	for (let i=0; i<rowList.length; i++) {
		if (checkColOrRowWin(rowList[i], 0)) {
			console.log('You win!');
			socket.emit('end game', {line: rowList[i]});
		}
		if (checkColOrRowWin(colList[i], 4)) {
			console.log('You win!');
			socket.emit('end game', {line: colList[i]});
		}
	}

	function checkDiagonalWin(diagonal) {
		let mark;
		let colCounter = 0;

		for (let i=0; i < diagonal.length; i++) {
			for (let key in tilesLib) {
				if(tilesLib[key].coord === diagonal[i] && (!mark || mark === tilesLib[key].mark)) {
					colCounter++;
					mark = tilesLib[key].mark;
				}
			}
		}
		if (colCounter === 3) {
			return true;
		}
		return false;
	}

	function checkColOrRowWin(prefix, index) {
		let mark;
		let colCounter = 0;
		for (let key in tilesLib) {
			if (tilesLib[key].coord.indexOf(prefix) === index && (!mark || mark === tilesLib[key].mark)) {
				colCounter++;
				mark = tilesLib[key].mark;
			}
		}
		if (colCounter === 3) {
			return true;
		}
		return false;
	}
}

