import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardBase } from './CardBase.js'
import { CardLibrary } from './CardLibrary.js'

let cardLibrary = new CardLibrary()

function p1Turn(){

	let userCardDivs = document.getElementById("rr-user-hand").children
	if (!userCardDivs) return

	for(let i=0;i<userCardDivs.length;i++) {
		userCardDivs[i].addEventListener("click",(e)=>{

			p1.playCardFromHand(i)
			
		})
	}

}

function p2Turn(){

	/* select a random card from p2 deck and play it */

	p2.playCardFromHand(0)


}

let p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(cardLibrary.cards), name: "You"})
let p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(cardLibrary.cards), name: "CPU"})


let game = new CardGame(p1,p2)

document.body.innerHTML = "<div id='board'></div>"

game.beginGame()



