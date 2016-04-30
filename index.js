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

const server = http.createServer(
	ecstatic({ root: path.resolve(__dirname, './public') })
).listen(port, () => {
	socket = io.listen(server);
	socket.sockets.on('connection', clientSetup);
	console.log(`Listening on port:${port}`);
})

function clientSetup(client) {

	const onDisconnect = () => {
		let playerToBeRemoved = clientFactory.getClientById(players, client.id);
		let spectatorToBeRemoved = clientFactory.getClientById(spectators, client.id);

		if (playerToBeRemoved) {
			clientFactory.checkAndDisableTurn(players[0]);
			clientFactory.checkAndDisableTurn(players[1]);
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
	}

	const onNewPlayer = () => {
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
	}

	const onTurnPlayer = (data) => {
		let player = clientFactory.getClientById(players, client.id);
		tilesLib[data.coord] = data.mark;
		client.broadcast.emit('turn player', {key: data.key, id: player.id, mark: player.mark});
	}

	const onEndGame = (data) => {
		if (data.line === 'catsGame') {
			players.forEach((player) => {
				player.client.emit('cats game');
			});
		} else {
			socket.sockets.emit('end game', {line: data.line});

			let isSpectator = false;
			spectators.forEach((spectator) => {
				if (client.id.includes(spectator.id)) {
					isSpectator = true;
				}
			});
			if (!isSpectator) {
				players.forEach((player) => {
					if (client.id.indexOf(player.client.id) > -1) {
						player.client.emit('loser');
					} else {
						player.client.emit('winner');
					}
				});
			}
		}
	}

	client.on('disconnect', onDisconnect);

	client.on('new player', onNewPlayer);

	client.on('turn player', onTurnPlayer);

	client.on('end game', onEndGame);
}
