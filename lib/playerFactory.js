'use strict'

const player = (clientId) => {

	return {
		id: clientId
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