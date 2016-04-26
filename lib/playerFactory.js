'use strict'

let marksInUse = [];

const player = (clientId) => {
	let mark;
	if (marksInUse.indexOf('x') > -1) {
		mark = 'o';
	} else {
		mark = 'x';
	}

	return {
		id: clientId,
		mark: mark
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

module.exports = {
	player: player,
	getPlayerById: getPlayerById
}