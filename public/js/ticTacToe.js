let buildCoordinates = require('./buildCoordinates');

let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload,
		create
	}
)

let socket;
let player;
let spectator;
let tilesList = [];
let tilesLib = [];
let usedTiles = [];
let lines = [];

let win;
let lose;
let draw;

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
	game.load.image('catsGame', 'assets/catsGame.jpg');
	game.load.image('spectator', 'assets/spectator.jpg');
}

function create () {
	socket = io.connect();
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	let coordMap = buildCoordinates.coordinates;

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

const setEventHandlers = () => {
	game.input.onDown.add((pointer) => {
		if (player && player.turn){
			for (let key in tilesList) {
				if (tilesList[key].tile.contains(pointer.x,pointer.y) && usedTiles.indexOf(tilesList[key].tile) < 0 ) {
					let markSprite = game.add.sprite(tilesList[key].tile.x+buildCoordinates.offsets[player.mark+'OFFSET'], tilesList[key].tile.y+buildCoordinates.offsets[player.mark+'OFFSET'], player.mark+'Mark');
					player.turn = false;
					usedTiles.push(tilesList[key].tile);
					tilesLib.push({
						usedTile: tilesList[key].tile,
						coord: tilesList[key].coord,
						mark: player.mark,
						markSprite
					});
					socket.emit('turn player', {key, coord: tilesList[key].coord, mark: player.mark});
				}
			}
		}
	});
}

const setSocketHandlers = () => {
  	socket.on('connect', onConnect);

  	socket.on('new player', onNewPlayer);

	socket.on('turn player', onTurnPlayer);

	socket.on('new spectator', onNewSpectator);

	socket.on('clear game', onClearGame);

	socket.on('end game', onEndGame);

	socket.on('winner', () => win = game.add.sprite(100, 100, 'win'));

	socket.on('loser', () => lose = game.add.sprite(100, 100, 'lose'));

	socket.on('cats game', () => draw = game.add.sprite(100, 100, 'catsGame'));
}

const onConnect = () => {
	console.log('Connected to socket server');

	socket.emit('new player');
}

const onNewPlayer = (data) => {
	if (!player) {
		console.log('Player connected:', data.id);
	}

	player = data;
	if (!player.turn) {
		console.log('Waiting for opponent player...');
	} else {
		console.log('Connection established with another player');
	}
}

const onTurnPlayer = (data) => {
	if (tilesList) {
		let markSprite = game.add.sprite(tilesList[data.key].tile.x+buildCoordinates.offsets[data.mark+'OFFSET'], tilesList[data.key].tile.y+buildCoordinates.offsets[data.mark+'OFFSET'], data.mark+'Mark');
		
		if (player) {
			player.turn = true;
		} else {
			addSpectatorSigil();
		}
		usedTiles.push(tilesList[data.key].tile);
		tilesLib.push({
			usedTile: tilesList[data.key].tile,
			coord: tilesList[data.key].coord,
			mark: data.mark,
			markSprite
		});
		if (player) {
			checkForWin();
		}
	}

	function addSpectatorSigil() {
		if (tilesList[data.key].coord === 'row2col2') {
			game.add.sprite(160, 160, 'spectator');
		}
	}

	function checkForWin() {
		let colList = ['col1', 'col2', 'col3'];
		let rowList = ['row1', 'row2', 'row3'];
		let diagonal1 = ['row1col1', 'row2col2', 'row3col3'];
		let diagonal2 = ['row3col1', 'row2col2', 'row1col3'];
		let hasWinner = false;

		if (checkDiagonalWin(diagonal1)) {
			hasWinner = true;
			socket.emit('end game', {line: 'lDiag'});
		}
		if (checkDiagonalWin(diagonal2)) {
			hasWinner = true;
			socket.emit('end game', {line: 'rDiag'});
		}
		for (let i=0; i<rowList.length; i++) {
			if (checkColOrRowWin(rowList[i], 0)) {
				hasWinner = true;
				socket.emit('end game', {line: rowList[i]});
			}
			if (checkColOrRowWin(colList[i], 4)) {
				hasWinner = true;
				socket.emit('end game', {line: colList[i]});
			}
		}

		if (!hasWinner && usedTiles.length === 9) {
			socket.emit('end game', {line: 'catsGame'})
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

		function checkColOrRowWin (prefix, index) {
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
}

const onNewSpectator = (data) => {
	spectator = data;
	console.log('Spectator of id ' + data.id + ' has connected');
	let coordMap = buildCoordinates.coordinates;
	let libMap = data.tilesLib;

	renderExistingSprites();

	function renderExistingSprites() {
		for (let key in libMap) {
			tilesLib.push ({
				markSprite: game.add.sprite(coordMap[key].x+buildCoordinates.offsets[libMap[key]+'OFFSET'], coordMap[key].y+buildCoordinates.offsets[libMap[key]+'OFFSET'],libMap[key]+'Mark')
			});
		}
		game.add.sprite(160, 160, 'spectator');
	}
}

const onClearGame = () => {
	if (player) {
		player.turn = false;
	}
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
	if (draw) {
		draw.kill();
	}

	tilesLib = [];
	usedTiles = [];
	lines = [];
}

const onEndGame = (data) => {
	renderLine(data.line);

	function renderLine(line) {
		if (line.indexOf('row') > -1) {
			let index = line[3];
			if (player) {
				player.turn = false;
			}
			lines.push(game.add.sprite(0, buildCoordinates.offsets['lineOFFSET'+index], 'hLine'));
		}
		if (line.indexOf('col') > -1) {
			let index = line[3];
			if (player) {
				player.turn = false;
			}
			lines.push(game.add.sprite(buildCoordinates.offsets['lineOFFSET'+index], 0, 'vLine'));
		}
		if (line === 'lDiag') {
			if (player) {
				player.turn = false;
			}
			lines.push(game.add.sprite(0, 0, 'lDiag'));
		}
		if (line === 'rDiag') {
			if (player) {
				player.turn = false;
			}
			lines.push(game.add.sprite(0, buildCoordinates.offsets.diagOFFSET, 'rDiag'));
		}
	}
}
