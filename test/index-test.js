'use strict';

const rewire = require('rewire');
const index = rewire('../index');
const assert = require('chai').assert;
const io = require('socket.io-client');

const socketURL = 'http://0.0.0.0:8080';

const options = {
	transports: ['websocket'],
	'force new connection': true
};

describe('Index', () => {
	describe('onNewPlayer test', ()=> {
		it('should acknowledge a client has connected', (done) => {
			const client1 = io.connect(socketURL, options);

			client1.on('connect', () => {
				client1.emit('new player');
			});

			client1.on('new player', (data) => {
				assert.equal(data.id, '/#'+client1.id);
				client1.disconnect();
				done();
			});
		});

		it('should acknowledge a spectator when connected', (done) => {			
			const pblPlayers = ['player1', 'player2'];
			index.__set__({'players': pblPlayers});

			const client1 = io.connect(socketURL, options);

			client1.on('connect', () => {
				client1.emit('new player');
			});

			client1.on('new spectator', (data) => {
				assert.equal(data.turn, undefined);
				assert.isObject(data.tilesLib, {});
				client1.disconnect();
				done();
			});
		});
	});

	describe('onTurnPlayer test', () => {
		it('should update library of tiles', (done) => {
			const client1 = io.connect(socketURL, options);

			client1.on('connect', () => {
				client1.emit('turn player', {key: 'theKey', coord: 'row1col1', mark: 'x'});
			});

			client1.on('turn player', (data) => {
				let pblTilesLib = index.__get__('tilesLib');
				console.log(pblTilesLib);
				done();
			});
		});
	});

});
