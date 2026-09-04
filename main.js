import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'

function p1Turn(){



	p1.renderBoard()
}

function p2Turn(){




}

let p1 = new CardPlayer({turnCallback:p1Turn})
let p2 = new CardPlayer({turnCallback:p2Turn})


let game = new CardGame(p1,p2)

document.body.innerHTML = "<div id='board'></div>"

game.beginGame()



