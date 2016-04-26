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
		mark: mark,
		turn: false,
		client: client
	}
}

function popMarksInUse(player) {
	let index = marksInUse.indexOf(player.mark);
	if (index > -1) {
		marksInUse.splice(index, 1);
	}
}

function getPlayerById(playersList, id) {
	if (playersList && playersList instanceof Array){
		for (let i=0; i<playersList.length; i++) {
			if (playersList[i].id === id) {
				return playersList[i];
			}
		}
	}
	return false;
}

function removePlayer(playersList, player) {
	playersList.splice(playersList.indexOf(player), 1);
}

function checkAndEnableTurn(player1, player2) {
	if (player1 && player2) {
		player1.turn = true;
		player2.turn = true;
	}
}

function checkAndDisableTurn(player1, player2) {
	if (player1) {
		player1.turn = false;
	}
	if (player2) {
		player2.turn = false;
	}
}

module.exports = {
	player: player,
	getPlayerById: getPlayerById,
	popMarksInUse: popMarksInUse,
	removePlayer: removePlayer,
	checkAndEnableTurn: checkAndEnableTurn,
	checkAndDisableTurn: checkAndDisableTurn
}