'use strict'

require('babel-core/register');
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const io = require('socket.io');
const playerFactory = require('./lib/playerFactory');

const port = process.env.PORT || 8080;
let players = [];
var socket;


var server = http.createServer(
	ecstatic({ root: path.resolve(__dirname, './public') })
).listen(port, (err) => {
	if (err) {
		throw err
	}

	socket = io.listen(server);
	socket.sockets.on('connection', clientSetup)
})

function clientSetup(client) {

	client.on('disconnect', () => {
		let playerToBeRemoved = playerFactory.getPlayerById(players, client.id);

		if (playerToBeRemoved) {
			let index = players.indexOf(playerToBeRemoved);
			players.splice(index, 1);
			console.log('Player has been removed');
		} else {
			console.log('Could not find player');
		}
	});

	client.on('new player', () => {
		if (players.length < 2) {
			let newPlayer = playerFactory.player(client.id);
			console.log('Player of #' + newPlayer.id + ' has entered');

			client.broadcast.emit('new player', {id: newPlayer.id})

			if (players.length === 1) {
				client.emit('new player', {id: players[0].id});
			}

			players.push(newPlayer);
		}
	});

	client.on('turn player', () => {

	});
}
