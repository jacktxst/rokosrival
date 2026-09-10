/*

	[PlayerController] -> [CardPlayer] <-> [CardGame] <-> [CardPlayer] <- [BotController]

*/


import { CardDeck } from './CardDeck.js'

/**

	An instance of this class exists in each round for both the player and the opponent.

*/
export class CardPlayer {

	/**
	 * 	args: {turnCallback : Callable, name : String, deck : Array, game : CardGame}
	 */
	constructor(args) {
		this.doTurn = args.turnCallback
		this.name   = args.name || "Default Name"
		this.deck   = args.deck
		this.game   = args.game || null

	}

	/** called by CardGame when the game begins */
	beginGame() {

		this.health = 100
		this.mana = 100
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
		this.opponent = (this === this.game.player1) ? this.game.player2 : this.game.player1
	}

	playCardFromHand(i, func) {
		
		if (this.mana < this.hand[i].cost) {
			return
		} else {
			this.mana -= this.hand[i].cost
		}

		this.played_card = i
		this.playedCard = this.hand[i]
		this.hand[i].onPlay?.bind(this)()

		// discard and draw

		this.hand.splice(i, 1)
		this.hand = [...this.hand, ...this.deck.drawCards(1)]

		// card play animation

		// a side effect of this function is it disables input to the game

		this.view.renderBoard()

		/* give control to the current player after animation plays */

		this.view.showPlayedCard( ()=>{
			if (func) func.bind(this)()
			return
		} )

		


		// this.game.yieldTurn()
	}

}