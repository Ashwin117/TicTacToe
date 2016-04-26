let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload: preload,
		create: create
	}
)

let socket;
let player;
let tilesList = [];
let usedTiles = [];

function preload () {
	game.load.image('grid', 'assets/grid.jpg');
	game.load.image('xMark', 'assets/xMark.jpg');
}

function create () {
	socket = io.connect();
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	let coordMap = window.buildCoordinates;

	for (let key in coordMap) {
		let tile = new Phaser.Rectangle(coordMap[key].x, coordMap[key].y, 125, 125);
		tilesList.push(tile);
	}

	game.input.onDown.add((pointer) => {
		for (let tile in tilesList) {
			if (tilesList[tile].contains(pointer.x,pointer.y) && usedTiles.indexOf(tilesList[tile]) < 0) {
				game.add.sprite(tilesList[tile].x+window.buildCoordinates.OFFSET, tilesList[tile].y+window.buildCoordinates.OFFSET, player.mark+'Mark');
				usedTiles.push(tilesList[tile]);
				socket.emit('turn player', {tile: tile, mark: player.mark});
			}
		}
	})

	setEventHandlers();
}

let setEventHandlers = () => {
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
			game.add.sprite(tilesList[data.tile].x + window.buildCoordinates.OFFSET, tilesList[data.tile].y+window.buildCoordinates.OFFSET, 'xMark');
			usedTiles.push(tilesList[data.tile]);
		}
	});
}
