'use strict'

require('babel-core/register');
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const io = require('socket.io');
const clientFactory = require('./lib/clientFactory');

const port = process.env.PORT || 8080;
let players = [];
let spectators = [];
let socket;
let tilesLib = {};

let server = http.createServer(
	ecstatic({ root: path.resolve(__dirname, './public') })
).listen(port, (err) => {
	if (err) {
		throw err
	}

	socket = io.listen(server);
	socket.sockets.on('connection', clientSetup);
	console.log(`Listening on port:${port}`);
})

function clientSetup(client) {
	client.on('disconnect', () => {
		let playerToBeRemoved = clientFactory.getClientById(players, client.id);
		let spectatorToBeRemoved = clientFactory.getClientById(spectators, client.id);

		if (playerToBeRemoved) {
			clientFactory.checkAndDisableTurn(players[0], players[1]);
			clientFactory.popMarksInUse(playerToBeRemoved);
			console.log(`Player of id ${playerToBeRemoved.id} has been removed`);
			clientFactory.removeClient(players, playerToBeRemoved);

			tilesLib = {};
			socket.sockets.emit('clear game');
		} 
		if (spectatorToBeRemoved) {
			console.log(`Spectator of id ${spectatorToBeRemoved.id} has been removed`);
			clientFactory.removeClient(spectators, spectatorToBeRemoved);
		} 
		if (!playerToBeRemoved && !spectatorToBeRemoved) {
			console.log('Could not find player');
		}
	});

	client.on('new player', () => {
		if (players.length < 2) {
			let newPlayer = clientFactory.player(client);
			console.log(`Player of id ${newPlayer.id} has entered`);
			players.push(newPlayer);
			clientFactory.checkAndEnableTurn(players[0], players[1]);
			players.forEach((player) => {
				player.client.emit('new player', {id: player.id, mark: player.mark, turn: player.turn});
			});
		} else {
			let newSpectator = clientFactory.spectator(client);
			console.log(`Spectator of id ${newSpectator.id} has entered`);
			spectators.push(newSpectator);
			newSpectator.client.emit('new spectator', {id: newSpectator.id, tilesLib });
		}
	});

	client.on('turn player', (data) => {
		let player = clientFactory.getClientById(players, client.id);
		tilesLib[data.coord] = data.mark;
		client.broadcast.emit('turn player', {key: data.key, id: player.id, mark: player.mark});
	});

	client.on('end game', (data) => {
		socket.sockets.emit('end game', {line: data.line});

		let spectatorsIDs = spectators.map((spectator) => spectator.id);
		if (spectatorsIDs.indexOf(client.id) < 0) {
			players.forEach((player) => {
				if (client.id === player.client.id) {
					player.client.emit('loser');
				} else {
					player.client.emit('winner');
				}
			});
		}
	});
}
