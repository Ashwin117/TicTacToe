let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload: preload,
		create: create,
		update: update
	}
)

let socket;
let player;
let tilesList = [];
let tilesLib = [];
let usedTilesList = [];

function preload () {
	game.load.image('grid', 'assets/grid.jpg');
	game.load.image('xMark', 'assets/xMark.jpg');
	game.load.image('oMark', 'assets/oMark.jpg');
}

function create () {
	socket = io.connect();
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	let coordMap = window.buildCoordinates;

	for (let key in coordMap) {
		let tile = new Phaser.Rectangle(coordMap[key].x, coordMap[key].y, 125, 125);
		tilesList.push(tile);
	}

	setEventHandlers();

	setSocketHandlers();
}

function update () {
	console.log('asdf');
}

let setEventHandlers = () => {
	game.input.onDown.add((pointer) => {
		if (player.turn){
			for (let tile in tilesList) {
				if (tilesList[tile].contains(pointer.x,pointer.y) && usedTilesList.indexOf(tilesList[tile]) < 0 ) {
					let markSprite = game.add.sprite(tilesList[tile].x+window.buildCoordinates[player.mark+'OFFSET'], tilesList[tile].y+window.buildCoordinates[player.mark+'OFFSET'], player.mark+'Mark');
					player.turn = false;
					usedTilesList.push(tilesList[tile]);
					tilesLib.push({
						usedTile: tilesList[tile],
						mark: player.mark,
						markSprite: markSprite
					});
					socket.emit('turn player', {tile: tile, mark: player.mark});
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
			let markSprite = game.add.sprite(tilesList[data.tile].x+window.buildCoordinates[data.mark+'OFFSET'], tilesList[data.tile].y+window.buildCoordinates[data.mark+'OFFSET'], data.mark+'Mark');
			player.turn = true;
			usedTilesList.push(tilesList[data.tile]);
			tilesLib.push({
				usedTile: tilesList[data.tile],
				mark: data.mark,
				markSprite: markSprite
			});
		}
	});

	socket.on('end game', () => {
		player.turn = false;
		for (let tile in tilesLib) {
			tilesLib[tile].markSprite.kill();
		}
	});
}
