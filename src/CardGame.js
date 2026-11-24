/**

	Represents a single match between two CardPlayers
	The opponents interact indirectly through this CardGame class, which they will share a reference to
	The CardGame also stores references to each of its Players

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/

import { TriggerCardEvent, ReturnControlEvent, eventQueue } from './ResolveCardPlay.js'
import { assert } from './Helpers.js'

export class CardGame {

	constructor(player1, player2) {
		this.player1 = player1
		this.player2 = player2
		this.currentPlayer = player1
		player1.cardGame = this
		player1.opponent = player2
		player2.cardGame = this
		player2.opponent = player1
		this.view = null
	}

	/** */
	beginGame() {
		this.player1.view = this.view;
		this.player2.view = this.view;
		this.player1.beginGame();
		this.player2.beginGame();
		this.view.renderBoard();
		this.currentPlayer.doTurn();
	}

	yieldTurn() {

		this.view.renderBoard()

		assert( eventQueue.length === 0, "EventQueue still running!" );

		// activate any active cards with "rest" triggers
		for (let card of this.currentPlayer.activeCards) {
			
			eventQueue.push(  

				new TriggerCardEvent( card, "rest" ),

			)

		}

		/*

		spell mana decay, fizzle, exit, and grieve

		 */
		for (let card of this.currentPlayer.activeCards) {
			if (card.type.kind === "spell") {
				card.mana -= 1
				if (card.mana === 0) {
					eventQueue.splice(1,0,new TriggerCardEvent( card, "exit" ))
					this.currentPlayer.activeCards = this.currentPlayer.activeCards.filter(item => item !== card)

					for (let triggerCard of [...this.currentPlayer.activeCards, ...this.currentPlayer.opponent.activeCards]) {
						eventQueue.splice(1,0,new TriggerCardEvent( triggerCard, "grieve", card ))
					}
				}
			}
		}

		// reset mana for both players at the end of each turn
		this.player1.mana = this.player1.baseMana
		this.player2.mana = this.player2.baseMana

		this.view.renderBoard()

		// swap active players
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

		// after all the triggers resolve, allow the active player to make their turn
		eventQueue.push(
			new ReturnControlEvent()
		)

	}

}