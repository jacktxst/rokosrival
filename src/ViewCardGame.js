/*

	This is the code responsible for 
	rendering the ongoing card match 
	as visible HTML elements.

*/

import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { gameState } from './GameState.js'
import { CardPlayerHuman } from './CardPlayerHuman.js'
import { CardPlayerBot } from './CardPlayerBot.js'
import { capitalize, escapeHtml } from './Helpers.js'
import { formatCost, formatTrigger, formatCard, formatEffect } from './CardFormatHelpers.js'

/*

	Main board rendering code:	

*/

export class ViewCardGame {


	constructor(cardGame) {
		
		this.cardGame = cardGame
		this.p1 = cardGame.player1 
		this.p2 = cardGame.player2
		
	}

	/*	
	=========================================
		renderBoard() 
	=========================================
		Clear the screen and render the 
		ongoing card match as visible 
		HTML elements. This function
		has the side effect of disabling
		player input even if it is their 
		turn.
	=========================================
	*/
	renderBoard(){ 


		const opponent = this.p2
		const p1 = this.p1

		document.body.innerHTML = `

			<div id="board">

				<div id="opponent-hud" class="shadow-bg" style="display: flex; justify-content: space-between;">

					<div id="opponent-hand">
					
					${(()=>{
						let string = ""
						for (let i=0;i<opponent.hand.length;i++) {
							string += `
								<div class="opponent-card"></div>
							`
						}
						return string
					})()}
					
					</div>

					<div id="rival-stats">
					${opponent.name}: [${opponent.health} Health]

					</div>
				</div>

				
	
				<div class="deployed-cards" id="opponent-deployed-cards">
					${(()=>{
						let string = ""
						for (let card of opponent.activeCards) {
							string += `
									${card.renderHTML()}
							`
						}
						return string
					})()}
				</div>
	
				<div id="frontline">
						<div id="end-turn-button" class="stone-button"> End Turn </div>
				</div>
	
				<div class="deployed-cards" id="player-deployed-cards">
					${(()=>{
						let string = ""
						for (let card of p1.activeCards) {
							string += `
									${card.renderHTML()}
							`
						}
						return string
					})()}
				</div>
		
				<div id="player-hud" class="shadow-bg" style="display:flex; flex-direction: row;">

					<div id="roko-stats">
					${p1.name}: [${p1.health} Health] [${p1.mana} Mana]
					</div>

					<div id="player-hand">
					${(()=>{
						let string = ""
						for (let card of p1.hand) {
							string += `
								${card.renderHTML()}
							`
						}
						return string
					})()}
					</div>

				</div>	
			</div>
			
		`

	}

}




	
