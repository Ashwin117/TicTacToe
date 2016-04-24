'use strict'

const player = () => {
	const id = Math.floor((Math.random() * 10) + 1);

	return {
		id: id
	}
}

function getPlayerById(playersList, id) {
	if (playersList && playersList instanceof Array){
		for (let i=0; i<playersList.length; i++) {
			if (playersList[i] === id) {
				return playersList[i]
			}
		}
	}
	return false;
}

module.exports = {
	player: player,
	getPlayerById: getPlayerById
}