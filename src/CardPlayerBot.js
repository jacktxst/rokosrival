import {CardPlayerBase} from './CardPlayerBase.js'

export class CardPlayerBot extends CardPlayerBase {

	doTurn() {
		this.deployCardFromHand(0, ()=>{this.cardGame.yieldTurn()})
	}

	selectTargets( max, alignment, kind, callback ) {

		let targets = []

		callback(targets)

	}
}