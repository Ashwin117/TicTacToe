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
	socket.sockets.on('connection', clientSetup);
	console.log('Listening on localhost:' + port);
})

function clientSetup(client) {

	client.on('disconnect', () => {
		let playerToBeRemoved = playerFactory.getPlayerById(players, client.id);

		if (playerToBeRemoved) {
			playerFactory.checkAndDisableTurn(players[0], players[1]);
			playerFactory.popMarksInUse(playerToBeRemoved);
			playerFactory.removePlayer(players, playerToBeRemoved);
			console.log('Player has been removed');
		} else {
			console.log('Could not find player');
		}
	});

	client.on('new player', () => {
		if (players.length < 2) {
			let newPlayer = playerFactory.player(client);
			console.log('Player of id ' + newPlayer.id + ' has entered');

			players.push(newPlayer);
			playerFactory.checkAndEnableTurn(players[0], players[1]);
			players.forEach((player) => {
				player.client.emit('new player', {id: player.id, mark: player.mark, turn: player.turn});
			});
		}
	});

	client.on('turn player', (data) => {
		let player = playerFactory.getPlayerById(players, client.id);
		client.broadcast.emit('turn player', {tile: data.tile, id: player.id, mark: player.mark});
	});
}
