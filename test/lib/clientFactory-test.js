'use strict';

const rewire = require('rewire');
const clientFactory = rewire('../../lib/clientFactory');
const assert = require('chai').assert;

describe('Test clientFactory', () => {
	let client1 = {
		id: 'Testid1'
	}
	let client2 = {
		id: 'Testid2'
	}

	describe('Test player', () => {
		let player1 = clientFactory.player(client1);
		let player2 = clientFactory.player(client2);

		it('contains id property', () => {
			assert.equal(player1.id, 'Testid1');
		});

		it('contains turn property', () => {
			assert.isFalse(player1.turn);
		});

		it('contains an assigned mark x', () => {
			assert.equal(player1.mark, 'x');
		});

		it('contains a client object associated with it', () => {
			assert.deepEqual(player1.client, client1);
		});

		it('second player contains an assigned mark o', () => {
			assert.equal(player2.mark, 'o');
		});
	});

	describe('Test spectator', () => {
		let spectator1 = clientFactory.spectator(client1);

		it('contains id property', () => {
			assert.equal(spectator1.id, 'Testid1');
		});

		it('contains client property', () => {
			assert.deepEqual(spectator1.client, client1);
		});

		it('contains no turn', () => {
			assert.equal(spectator1.turn, undefined);
		});
	});

	describe('Test popMarksInUse', () => {
		let player1 = clientFactory.player(client1);
		let player2 = clientFactory.player(client2);
		let prvMarksInUse;

		it('pops mark for other players use', () => {
			prvMarksInUse = clientFactory.__get__('marksInUse');
			let beforeLength = prvMarksInUse.length;
			clientFactory.popMarksInUse(player1);
			assert.equal(beforeLength - prvMarksInUse.length, 1);
		});

		it('pops nothing if nothing exists', () => {
			clientFactory.__set__({marksInUse: []});
			clientFactory.popMarksInUse(player1);
			prvMarksInUse = clientFactory.__get__('marksInUse');
			assert.equal(prvMarksInUse.length, 0);
		});
	});

	describe('Test getClientById', () => {
		let clientList = [clientFactory.player(client1), clientFactory.player(client2)];

		it('retrieves appropriate client info', () => {
			let player = clientFactory.getClientById(clientList, client1.id);
			assert.equal(client1.id, player.id);
		});

		it('returns false if a proper list is not given', () => {
			assert.isFalse(clientFactory.getClientById({}, client1.id));
		});

		it('returns false if client id is not there', () => {
			assert.isFalse(clientFactory.getClientById(clientList, '117'));
		});
	});

	describe('Test removeClient', () => {
		let clientList = [clientFactory.player(client1), clientFactory.player(client2)];

		it('removes client based on client id', () => {
			assert.equal(clientList.length, 2);
			clientFactory.removeClient(clientList, client1.id);
			assert.equal(clientList.length, 1);
		});

		it('does nothing if no clientList is supplied', () => {
			let clientList = [];
			clientFactory.removeClient(clientList, client1.id);
			assert.equal(clientList.length, 0);
		});
	});

	describe('Test checkAndEnableTurn', () => {
		it('enables turn property of player', () => {
			let player1 = clientFactory.player(client1);
			let player2 = clientFactory.player(client2);

			clientFactory.checkAndEnableTurn(player1, player2);
			assert.isTrue(player1.turn);
			assert.isTrue(player2.turn);
		});

		it('does not enable turn property if second parameter is not appropriate', () => {
			let player1 = clientFactory.player(client1);

			clientFactory.checkAndEnableTurn(player1, null);
			assert.isFalse(player1.turn);
		});
	});

	describe('Test checkAndDisableTurn', () => {
		let player1;
		beforeEach(() => {
			player1 = clientFactory.player(client1);
			player1.turn = true;
		});

		it('disables turn property of player', () => {
			clientFactory.checkAndDisableTurn(player1);
			assert.isFalse(player1.turn);
		});

		it('does nothing if inappropriate parameter is passed', () => {
			assert.isTrue(player1.turn);
			clientFactory.checkAndDisableTurn(null);
			assert.isTrue(player1.turn);
		});
	});
});