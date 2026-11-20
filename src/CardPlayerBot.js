import {CardPlayerBase} from './CardPlayerBase.js'
import { pick } from './Helpers.js'

export class CardPlayerBot extends CardPlayerBase {

	doTurn() {
		
		cardPlay = pick(this.hand, this.hand.length)
		
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
	}

}