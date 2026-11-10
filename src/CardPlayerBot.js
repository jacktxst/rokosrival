import {CardPlayerBase} from './CardPlayerBase.js'

export class CardPlayerBot extends CardPlayerBase {

	doTurn() {
		if (this.hasPlayed) {
			this.hasPlayed = false
			this.cardGame.yieldTurn()
		}
		this.deployCardFromHand(0)
		this.hasPlayed = true
	}

	selectTargets( max, alignment, kind, callback ) {

		let targets = []

		callback(targets)

	}
}