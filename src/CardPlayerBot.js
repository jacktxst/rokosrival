export class CardPlayerBot extends CardPlayer {

	doTurn() {
		this.playCardFromHand(0, ()=>{this.cardGame.yieldTurn()})
	}

	selectTargets( max, alignment, kind, callback ) {

		let targets = []

		callback(targets)

	}
}