let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload: preload,
		create: create
	}
)

function preload () {
	game.load.image('grid', 'assets/grid.jpg');
	game.load.image('xMark', 'assets/xMark.jpg');
}

let socket;
let player;

function create () {
	socket = io.connect();
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	let coordMap = window.buildCoordinates;
	let tilesList = [];

	for (let key in coordMap) {
		let tile = new Phaser.Rectangle(coordMap[key].x, coordMap[key].y, 125, 125);
		tilesList.push(tile);
	}

	game.input.onDown.add((pointer) => {
		for (let tile in tilesList) {
			if (tilesList[tile].contains(pointer.x,pointer.y)) {
				game.add.sprite(tilesList[tile].x + window.buildCoordinates.OFFSET, tilesList[tile].y + window.buildCoordinates.OFFSET, 'xMark');
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
  		console.log('New player connected:', data.id);
	});
}
