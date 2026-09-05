import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardBase } from './CardBase.js'
import { CardLibrary } from './CardLibrary.js'

let cardLibrary = new CardLibrary()

function p1Turn(){



	p1.renderBoard()
}

function p2Turn(){




}

let p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(cardLibrary.cards)})
let p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(cardLibrary.cards)})

window.p1 = p1
window.p2 = p2


let game = new CardGame(p1,p2)

document.body.innerHTML = "<div id='board'></div>"

game.beginGame()



