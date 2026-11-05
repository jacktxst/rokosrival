/*

	[PlayerController] -> [CardPlayer] <-> [CardGame] <-> [CardPlayer] <- [BotController]

*/


import { CardDeck } from './CardDeck.js'
import {resolveEffect} from './ResolveCardPlay.js'

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
		this.baseMana = 100
		this.mana = this.baseMana
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
		this.opponent = (this === this.game.player1) ? this.game.player2 : this.game.player1
	}

	playCardFromHand(i, func) {

		for (let j = 0; j < this.hand[i].costs.length; j++) {	
			if (this.hand[i].costs[j].kind === "payMana") {
				if (this.mana < this.hand[i].costs[j].amount) {
					return
				} else {
					this.mana -= this.hand[i].costs[j].amount
				}
			}
			if (this.hand[i].costs[j].kind === "payLife") {
				if (this.health < this.hand[i].costs[j].amount) {
					return
				} else {
					this.health -= this.hand[i].costs[j].amount
				}
			}
			if (this.hand[i].costs[j].kind === "fizzleFriendlyNonPlayers") {
				// for now this cost will empty the hand
				if ((this.hand.length - 1 - i) < this.hand[i].costs[j].amount) {
					return
				} else {
					this.hand.splice(i+1,this.hand[i].costs[j].amount)
					this.hand = [...this.hand, ...this.deck.drawCards(this.hand[i].costs[j].amount)]
				}
			}
		}

		this.played_card_i = i
		this.played_card = this.hand[i]
		
		for (let j = 0; j < this.played_card.triggers.length; j++) {
			if (this.played_card.triggers[j].kind === "entry") {
			resolveEffect.bind(this)(this.played_card.triggers[j]);
			}
		}

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