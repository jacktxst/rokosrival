/*

	This is the code responsible for 
	rendering the ongoing card match 
	as visible HTML elements.

*/


/*

	Main board rendering code:	

*/

import {renderQueueHTML} from './ResolveCardPlay.js'

export class CardGameRenderer {


	constructor(cardGame) {
		
		this.cardGame = cardGame
		this.cardGame.view = this
		
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


		const opponent = this.cardGame.player2;
		const p1 = this.cardGame.player1;

		document.body.innerHTML = `

			<div id="queue" style="background-color: white; position: absolute; display:flex; flex-direction: column;">${renderQueueHTML()}</div>

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
						return string;
					})()}
					
					</div>

					<div id="rival-stats">
					${opponent.name}: [${opponent.health} Health] [${opponent.mana} Mana] [${opponent.shield} Shield]

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
						<div id="selection-prompt" style="color:white;"> </div>
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
					${p1.name}: [${p1.health} Health] [${p1.mana} Mana] [${p1.shield} Shield]
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
			
		`;

	}

}




	
