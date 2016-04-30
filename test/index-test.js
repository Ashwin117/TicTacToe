'use strict';

const rewire = require('rewire');
const index = rewire('../index');
const assert = require('chai').assert;
const sinon = require('sinon');
const io = require('socket.io-client');

const socketURL = 'http://localhost:8080';

const options = {
	reconnect: true
};

describe('Index', () => {
	it('server error', () => {
		try {
			const client1 = io.connect('saduf', options);
		} catch(ex) {
			console.log(ex);
		}
	});

	describe('onNewPlayer test', () => {
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
			const client2 = io.connect(socketURL, options);

			client1.on('connect', () => {
				client1.emit('turn player', {key: 'theKey', coord: 'row1col1', mark: 'x'});
			});

			client2.on('turn player', (data) => {
				let pblTilesLib = index.__get__('tilesLib');
				assert.equal(pblTilesLib.row1col1, 'x');
				done();
			});
		});
	});

	describe('onEndGame test', () => {
		it('should update all players of cats game', (done) => {
			let client1 = io.connect(socketURL, options);
			let client2 = io.connect(socketURL, options);

			let emitStub2 = sinon.stub(client2, 'emit')
			emitStub2.onFirstCall().returns(done());

			const pblPlayers = [{id: 'player2', client: client2}];
			index.__set__({'players': pblPlayers});

			client1.on('connect', () => {
				client1.emit('end game', {line: 'catsGame'});
			});
		});

		it('reaches end game dispatch', (done) => {
			const client1 = io.connect(socketURL, options);
			const client2 = io.connect(socketURL, options);

			const pblPlayers = [{id: client1.id, client: client1}, {id: client2.id, client: client2}];
			const pblSpectators = [{id: 'sampleSpectator', client: {}}]
			index.__set__({'players': pblPlayers});
			index.__set__({'spectators': pblSpectators});

			client1.on('connect', () => {
				client1.emit('end game', {});
			});

			client1.on('end game', (data) => {
				assert.isTrue(!!client1.id);
				client1.disconnect();
				done();
			});
		});

		it('should update winner of game', (done) => {
			let client1 = io.connect(socketURL, options);
			let client2 = io.connect(socketURL, options);

			let emitStub2 = sinon.stub(client2, 'emit');

			client1.on('connect', () => {
				client2.id = client1.id;
				emitStub2.returns(done());

				const pblPlayers = [{id: client1.id, client: client2}];
				index.__set__({'players': pblPlayers});

				client1.emit('end game', {});
			});
		});

		it('should update loser of game', (done) => {
			let client1 = io.connect(socketURL, options);
			let client2 = io.connect(socketURL, options);

			let emitStub2 = sinon.stub(client2, 'emit');

			client1.on('connect', () => {
				client2.id = 'differentId';
				emitStub2.returns(done());

				const pblPlayers = [{id: client1.id, client: client2}];
				index.__set__({'players': pblPlayers});

				client1.emit('end game', {});
			});
		});

		it('should not do anything to notify spectators', (done) => {
			let client1 = io.connect(socketURL, options);
			let client2 = io.connect(socketURL, options);

			let emitStub2 = sinon.stub(client2, 'emit')

			client1.on('connect', () => {
				client2.id = client1.id;
				const pblSpectators = [{id: client2.id, client: client2}];
				index.__set__({'spectators': pblSpectators});

				client1.emit('end game', {});
			});

			client1.on('end game', (data) => {
				assert.isTrue(!!client1.id);
				done();
			});
		});
	});
});
