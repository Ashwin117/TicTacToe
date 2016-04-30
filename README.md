# TicTacToe
Welcome to a game of TicTacToe!

###Getting Started###

Here are the two commands to start this game after cloning this repo. I recommend using node 4 as the repo is littered with ES6.

```
	> npm install
	> npm run build
	> npm start
```

You can run `> npm run cover` or `> npm test`as this repo has tested for 100% code coverage for server side code

This repo allows two players to play TicTacToe. Any additional entries into the localhost of this game will act as a spectator.


###Cool features of this game###
1. Uses `socket.io` for multiple servers to collude for a turn based game
1. Uses ES6 for writing code as smoothly as possible.
1. Uses `babel` and `browserify` and to compile client side code to common js and to display `bundle.js`
1. Uses `phaser` as Javascript game engine
1. Uses `sinon`, `rewire`, and `mocha` for server side unit testing along with `istanbul` for looking at code coverage
