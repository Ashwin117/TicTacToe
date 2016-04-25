let game = new Phaser.Game(375, 375, Phaser.AUTO, '', 
 	{ 
		preload: preload, 
		create: create, 
		update: update, 
		render: render 
	}
)

function preload () {
	game.load.image('grid', 'assets/grid.jpg')
}

let socket;
let player;

function create () {
	socket = io.connect()
	game.add.tileSprite(0, 0, 375, 375, 'grid');

	const row1col1 = new Phaser.Rectangle(0, 0, 125, 125);
	const row1col2 = new Phaser.Rectangle(125, 0, 125, 125);
	const row1col3 = new Phaser.Rectangle(250, 0, 125, 125);
	
	const row2col1 = new Phaser.Rectangle(0, 125, 125, 125);
	const row2col2 = new Phaser.Rectangle(125, 125, 125, 125);
	const row2col3 = new Phaser.Rectangle(250, 125, 125, 125)	
	
	const row3col1 = new Phaser.Rectangle(0, 250, 125, 125);
	const row3col2 = new Phaser.Rectangle(125, 250, 125, 125);
	const row3col3 = new Phaser.Rectangle(250, 250, 125, 125);

	game.input.onDown.add((pointer) => {    
		var inside = row3col3.contains(pointer.x,pointer.y)    
		console.log('pointer is inside region top left quarter', inside)
	})

	setEventHandlers();
}

let setEventHandlers = () => {
  	socket.on('connect', () => {
  		console.log('Connected to socket server')

  		socket.emit('new player');
  	});

  	socket.on('new player', (data) => {
  		console.log('New player connected:', data.id)
	});
}

function update () {

}

function render () {

}