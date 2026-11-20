import {CardPlayerBase} from './CardPlayerBase.js'
import { pick } from './Helpers.js'

export class CardPlayerBot extends CardPlayerBase {

	doTurn() {
		
		let cardPlay = pick(this.hand, this.hand.length)
		
		for (let card of cardPlay)  {
			let i = this.hand.findIndex(item => item === card)

			this.deployCardFromHand( i )
		}

		this.cardGame.yieldTurn()

	}

	selectFromCandidates( maxTargets, candidates, resultsCallback ) {
		let selection = pick(candidates, maxTargets)

		const opponentCardDivs = document.getElementById("opponent-deployed-cards").children
		const playerCardDivs   = document.getElementById(  "player-deployed-cards").children
	
		function displayActiveCardSelection(divs, player) {
			for (let i = 0; i < divs.length; i++) {
				if (selection.includes(this.activeCards[i])) {
					divs[i].classList.add("card-targeted")
				}
			}
		}

		displayActiveCardSelection(opponentCardDivs, this.opponent)
		displayActiveCardSelection(playerCardDivs, this)

		// Must account for players being selected

		if (selection.includes( this )) {
			const rivalDiv = document.getElementById("rival-stats")

			rivalDiv.classList.add("card-targeted")
		}

		if (selection.includes( this.opponent )) {
			const rokoDiv = document.getElementById("roko-stats")

			rokoDiv.classList.add("card-targeted")
		}

		this.cardGame.view.renderBoard()
		resultsCallback(selection)
	}

}