import {CardPlayerBase} from './CardPlayerBase.js'
import {formatTargets} from "./CardFormatHelpers.js";
import {clearEvents, eventQueue} from "./ResolveCardPlay.js";
import {assert} from "./Helpers.js";
import {loseGame} from "./MenuGameOver.js";

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

		assert(eventQueue[0].kind === "gather-targets", "event must be of kind gather-targets!")

		let effect = eventQueue[0].effect

		assert(effect, "effect not defined!")

		document.getElementById("selection-prompt").innerHTML = `Select ${formatTargets(effect.selection.targets)} for ${effect.amount} ${effect.kind} `

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

		/*
		   PLAYER IS SELECTABLE NOW BUT THIS CODE NEEDS TO BE CLEANED UP
		*/

		if (candidates.includes( this )) {

			const rokoDiv = document.getElementById("roko-stats")

			rokoDiv.classList.add("card-hoverable")
			rokoDiv.addEventListener("click", (e)=>{

				switch ( selection.includes( this ) ) {
					case true:
						selection = selection.filter( item => item !== this )
						rokoDiv.classList.remove("card-targeted")
						break;
					case false:
						if (selection.length < maxTargets) {
							selection.push(this)
							rokoDiv.classList.add("card-targeted")
						}
						break;
				}

			})

		}

		if (candidates.includes( this.opponent )) {

			const rivalDiv = document.getElementById("rival-stats")

			rivalDiv.classList.add("card-hoverable")
			rivalDiv.addEventListener("click", (e)=>{

				switch ( selection.includes( this.opponent ) ) {
					case true:
						selection = selection.filter( item => item !== this.opponent )
						rivalDiv.classList.remove("card-targeted")
						break;
					case false:
						if (selection.length < maxTargets) {
							selection.push(this.opponent)
							rivalDiv.classList.add("card-targeted")
						}
						break;
				}

			})

		}

		/*
		 we reuse the end turn button for the submit selection button. 
		makes sense only bc you shouldnt be able to end turn during
		a selection prompt anyways, but i dont really like this solution.
		*/

		document.getElementById("end-turn-button").innerHTML = "Submit Selection"
		document.getElementById("end-turn-button").addEventListener("click",(e)=>{
			this.cardGame.view.renderBoard()
			resultsCallback(selection)
		})

	}

	fizzle() {
		clearEvents()
		loseGame()
	}

}