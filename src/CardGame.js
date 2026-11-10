/**

	Represents a single match between two CardPlayers
	The opponents interact indirectly through this CardGame class, which they will share a reference to
	The CardGame also stores references to each of its Players

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/

import { TriggerCardEvent, ReturnControlEvent, eventQueue } from './ResolveCardPlay.js'


export class CardGame {

	constructor(player1, player2, gameView) {
		this.view = gameView
		this.player1 = player1
		this.player2 = player2
		this.currentPlayer = player1
		player1.cardGame = this
		player2.cardGame = this
	}

	/** */
	beginGame() {
		this.player1.view = this.view
		this.player2.view = this.view
		this.player1.beginGame()
		this.player2.beginGame()
		this.view.renderBoard()
		this.currentPlayer.doTurn()
	}

	yieldTurn() {
		// activate any active cards with "rest" triggers
		for (let card of this.currentPlayer.activeCards) {
			
			eventQueue.push(  

				new TriggerCardEvent( card, "rest" ),

			)

		}

		// note that renderBoard also removes event listeners, thus disabling the player from making a move. correct.

		// reset mana for both players at the end of each turn
		this.player1.mana = this.player1.baseMana
		this.player2.mana = this.player2.baseMana


		this.view.renderBoard()

		if (this.currentPlayer === this.player1) {
			this.currentPlayer = this.player2
		} else {
			this.currentPlayer = this.player1
		}

		// activate any active cards with "awaken" triggers
		for (let card of this.currentPlayer.activeCards) {

			eventQueue.push(  

				new TriggerCardEvent( card, "awaken" ),

			)

		}

		eventQueue.push(
			new ReturnControlEvent()
		)

	}

}