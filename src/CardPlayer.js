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
		this.energy = 0
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
		this.opponent = (this === this.game.player1) ? this.game.player2 : this.game.player1
	}

	

	playCardFromHand(i) {
		this.played_card = i
		this.playedCard = this.hand[i]
		this.hand[i].onPlay?.bind(this)()
		
		// discard and draw

		this.hand.splice(i, 1)
		this.hand = [...this.hand, ...this.deck.drawCards(1)]

		this.game.yieldTurn()
	}

}