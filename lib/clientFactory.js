'use strict'

let marksInUse = [];

const player = (client) => {
	let mark;
	if (marksInUse.indexOf('x') < 0) {
		mark = 'x';
	} 
	else {
		mark = 'o';
	}
	marksInUse.push(mark);

	return {
		id: client.id,
		mark,
		turn: false,
		client
	}
}

const spectator = (client) => {
	return {
		id: client.id,
		client
	}
}

function popMarksInUse(player) {
	let index = marksInUse.indexOf(player.mark);
	if (index > -1) {
		marksInUse.splice(index, 1);
	}
}

function getClientById(clientsList, id) {
	if (clientsList && clientsList instanceof Array){
		for (let i=0; i<clientsList.length; i++) {
			if (clientsList[i].id === id) {
				return clientsList[i];
			}
		}
	}
	return false;
}

function removeClient(clientsList, client) {
	clientsList.splice(clientsList.indexOf(client), 1);
}

function checkAndEnableTurn(player1, player2) {
	if (player1 && player2) {
		player1.turn = true;
		player2.turn = true;
	}
}

function checkAndDisableTurn(player1) {
	if (player1) {
		player1.turn = false;
	}
}

module.exports = {
	player,
	spectator,
	getClientById,
	popMarksInUse,
	removeClient,
	checkAndEnableTurn,
	checkAndDisableTurn
}