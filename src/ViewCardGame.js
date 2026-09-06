import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardBase } from './CardBase.js'
import { CardLibrary } from './CardLibrary.js'

import { p1Turn } from './GamePlayerController.js'
import { p2Turn } from './GameBotController.js'


/**
	
		renders the board from this player's perspective, and is responsible for setting up event listeners on the cards themselves

	*/

export class ViewCardGame {


	constructor() {
		this.cardLibrary = new CardLibrary()
		this.p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(this.cardLibrary.cards), name: "You"})
		this.p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(this.cardLibrary.cards), name: "CPU"})
		this.game = new CardGame(this.p1,this.p2,this)
		document.body.innerHTML = "<div id='board'></div> <div class='rr-played-card' id='rr-played-card-p1'></div> <div class='rr-played-card' id='rr-played-card-p2'></div>"
		this.game.beginGame()
	}

	renderBoard(){ 
		const opponent = this.p2
		const p1 = this.p1
		document.getElementById("board").innerHTML = `
			<div class="rr-opp-battle-stat">
				${opponent.name}: ${opponent.health} HP
			</div>

			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-opp-hand">
					${(()=>{
						let string = ""
						for (let i=0;i<opponent.hand.length;i++) {
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
						for (let i=0;i<p1.hand.length;i++) {
							string += `
								<div class="rr-card rr-card-frontside">

									<h3>${p1.hand[i].name}</h3>
									${p1.hand[i].note}
								</div>
							`
						}
						return string
					})()}
				</div>
			</div>
						
			<div class="rr-user-battle-stat">
				${p1.name}: ${p1.health} HP
			</div>	
		`

	}

}


	