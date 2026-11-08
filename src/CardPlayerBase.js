/*

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/


import { CardDeck } from './CardDeck.js'
import { resolveEffect } from './ResolveCardPlay.js'

export class CardPlayerBase {

	constructor(args) {

		this.name        = args.name || "Default Name"
		this.deck        = args.deck
		this.discard     = args.discard || new CardDeck()
		this.cardGame    = args.game || null
		this.activeCards = []

	}

	/** called by CardGame when the game begins */
	beginGame() {

		this.health = 100
		this.baseMana = 100
		this.mana = this.baseMana
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
		this.opponent = (this === this.cardGame.player1) ? this.cardGame.player2 : this.cardGame.player1
	}

	/*
	==================================================================================
		playCardFromHand(i : int, func : Callable)
	==================================================================================
		i: the index of the card in the player's hand to be played
		
		func: a callback function which will be called once all the animations
		from playing this card are finished
	==================================================================================
		this function incurs the cost of a card,
		deploys the card to the board,
		triggers the card's ENTRY trigger,
		triggers any applicable GREET triggers, (TODO not yet implemented)
		removes card from hand and draws,
		reshuffles if necessary,
		plays an animation,
		re-renders the board,
		then returns control to the player so they can play more cards.

		this function can result in player death if they are out of
		cards and have already reshuffled. (TODO not yet implemented)
	==================================================================================
	*/
	playCardFromHand(i, func) {

		let card = this.hand[i]

		for (let j = 0; j < card.costs.length; j++) {	
			if (card.costs[j].kind === "payMana") {
				if (this.mana < card.costs[j].amount) {
					return
				} else {
					this.mana -= card.costs[j].amount
				}
			}
			if (card.costs[j].kind === "payLife") {
				if (this.health < card.costs[j].amount) {
					return
				} else {
					this.health -= this.hand[i].costs[j].amount
				}
			}
			if (card.costs[j].kind === "fizzleFriendlyNonPlayers") {
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
		
		/* deploy the card to the board */

		this.activeCards.push(card)

		/* if applicable, trigger this card's entry effect */

		triggerEffectOnCard( card, "entry" )

		/* TODO: we need to check if there are cards in play with a GREET trigger that needs
		to be triggered by this card */

		// remove card from hand and draw another

		this.hand.splice(i, 1)
		this.hand = [...this.hand, ...this.deck.drawCards(1)]

		// card play animation

		// a side effect of this function is it disables input to the game

		this.view.renderBoard()

		/* give control to the current player after animation plays */

		this.view.showPlayedCard( ()=>{
			if (func) func.bind(this)()
			else {
				this.doTurn()
			}
			return
		} )

	}

}