import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardBase } from './CardBase.js'
import { CardLibrary } from './CardLibrary.js'

import { GamePlayerController } from './GamePlayerController.js'
import { GameBotController } from './GameBotController.js'


/**
	
		renders the board from this player's perspective, and is responsible for setting up event listeners on the cards themselves

	*/

class ViewCardGame {


	constructor() {
		this.cardLibrary = new CardLibrary()
		this.p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(cardLibrary.cards), name: "You"})
		this.p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(cardLibrary.cards), name: "CPU"})
		this.game = new CardGame(p1,p2)
		document.body.innerHTML = "<div id='board'></div> <div class='rr-played-card' id='rr-played-card-p1'></div> <div class='rr-played-card' id='rr-played-card-p2'></div>"
		this.game.beginGame()
	}

	renderBoard(){ 
		const opponent = this.opponent
		document.getElementById("board").innerHTML = `
			<div class="rr-opp-battle-stat">
				${opponent.name}: ${opponent.health} HP
			</div>

			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-opp-hand">
					${(()=>{
						let string = ""
						for (let i=0;i<this.opponent.hand.length;i++) {
							string += `
								<div class="rr-card rr-card-backside"></div>
							`
						}
						return string
					})()}
				</div>
			</div>

			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-user-hand">
					${(()=>{
						let string = ""
						for (let i=0;i<this.hand.length;i++) {
							string += `
								<div class="rr-card rr-card-frontside">

									<h3>${this.hand[i].name}</h3>
									${this.hand[i].note}
								</div>
							`
						}
						return string
					})()}
				</div>
			</div>
						
			<div class="rr-user-battle-stat">
				${this.name}: ${this.health} HP
			</div>	
		`

	}

}


	