import {CardPlayerBase} from './CardPlayerBase.js'

export class CardPlayerBot extends CardPlayerBase {

	doTurn() {

		this.cardGame.yieldTurn()

	}

}