import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardBase } from './CardBase.js'

let cards = [

	new CardBase({
		name : "Card A"
	}),

	new CardBase({
		name : "Card B"
	}),

	new CardBase({
		name : "Card C"
	}),

	new CardBase({
		name : "Card D"
	}),

	new CardBase({
		name : "Card E"
	}),

	new CardBase({
		name : "Card F"
	}),

	new CardBase({
		name : "Card G"
	})
]

function p1Turn(){



	p1.renderBoard()
}

function p2Turn(){




}

let p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(cards)})
let p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(cards)})

window.p1 = p1
window.p2 = p2


let game = new CardGame(p1,p2)

document.body.innerHTML = "<div id='board'></div>"

game.beginGame()



