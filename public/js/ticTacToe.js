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

function preload () {
	game.load.image('grid', 'assets/grid.jpg');
	game.load.image('xMark', 'assets/xMark.jpg');
	game.load.image('oMark', 'assets/oMark.jpg');
	game.load.image('vLine', 'assets/vLine.jpg');
	game.load.image('hLine', 'assets/hLine.jpg');
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
  		player = data;
  		console.log('New player connected:', player.id);
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

		tilesLib = [];
		usedTiles = [];
		lines = [];
	});

	socket.on('end game', (data) => {
		renderLine(data.prefix);

		function renderLine(prefix) {
			let index = prefix[3];
			if (prefix.indexOf('row') > -1) {
				player.turn = false;
				lines.push(game.add.sprite(0, window.offsets['lineOFFSET'+index], 'hLine'));
			}
			if (prefix.indexOf('col') > -1) {
				player.turn = false;
				lines.push(game.add.sprite(window.offsets['lineOFFSET'+index], 0, 'vLine'));
			}
		}
	});
}

let checkForWin = () => {
	let colList = ['col1', 'col2', 'col3'];
	let rowList = ['row1', 'row2', 'row3'];

	for (let i=0; i<rowList.length; i++) {
		if (checkColOrRowWin(rowList[i], 0)) {
			socket.emit('end game', {prefix: rowList[i]})
		}
		if (checkColOrRowWin(colList[i], 4)) {
			socket.emit('end game', {prefix: colList[i]})
		}
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

