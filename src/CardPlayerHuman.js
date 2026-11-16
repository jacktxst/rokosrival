import {CardPlayerBase} from './CardPlayerBase.js'

export class CardPlayerHuman extends CardPlayerBase {

	/* 
	give the player the opportunity 
	to play multiple cards and then 
	end their turn 
	*/

	doTurn() {

		let userCardDivs = document.getElementById("player-hand").children
		if (!userCardDivs) return

		for(let i=0;i<userCardDivs.length;i++) {
			userCardDivs[i].addEventListener("click",(e)=>{

				if (event.target.closest('details')) {
				    return;
				}

				this.deployCardFromHand( i )
				
				
			})
		}

		document.getElementById("end-turn-button").addEventListener("click",(e)=>{
			this.cardGame.yieldTurn()
		})

	}

	/* ask the player to select some active cards to target 

	   once the player has made their selection, callback will
	   be called with the result

	*/

	selectFromCandidates( maxTargets, candidates, resultsCallback ) {

		let selection = []

		const opponentCardDivs = document.getElementById("opponent-deployed-cards").children
		const playerCardDivs   = document.getElementById(  "player-deployed-cards").children


		function prepareActiveCards(divs, player) {

			for (let i = 0; i < divs.length; i++) {
				if ( candidates.includes( player.activeCards[i] ) ) {
					divs[i].classList.add("card-hoverable")
					divs[i].addEventListener("click", (e)=>{
						switch ( selection.includes( player.activeCards[i] ) ) {
							case true:
								selection = selection.filter( item => item !== player.activeCards[i] )
								divs[i].classList.remove("card-targeted")
								break;
							case false:
								if (selection.length < maxTargets) {
									selection.push(player.activeCards[i])
									divs[i].classList.add("card-targeted")
								}
								break;
						}
					}) 
				}
			}

		}

		prepareActiveCards(opponentCardDivs, this.opponent)
		prepareActiveCards(playerCardDivs, this)

		// TODO: make players selectable somehow

		document.getElementById("end-turn-button").innerHTML = "Submit Selection"
		document.getElementById("end-turn-button").addEventListener("click",(e)=>{
			this.cardGame.view.renderBoard()
			callback(selection)
		})

	}

}