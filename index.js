'use strict'

require('babel-core/register');
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const io = require('socket.io');
const playerFactory = require('./lib/playerFactory');

const port = process.env.PORT || 8080;
let players = [];
let socket;


const server = http.createServer(
	ecstatic({ root: path.resolve(__dirname, '../public') })
).listen(port, (err) => {
	if (err) {
		throw err
	}

	socket = io.listen(server);
	socket.sockets.on('connection', clientSetup)
});

function clientSetup(client) {
	console.log('Player 1 has entered: ' + client.id);

	client.on('disconnect', () => {
		console.log(players);
		const playerToBeRemoved = playerFactory.getPlayerById(players, client.id);

		if (playerToBeRemoved) {
			console.log('Player has been removed');
		} else {
			console.log('Could not find player');
		}
	});

	client.on('new player', () => {

	});

	client.on('turn player', () => {

	});
}
