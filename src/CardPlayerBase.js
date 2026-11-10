/*

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/

import { TriggerCardEvent, ReturnControlEvent } from './ResolveCardPlay.js'
import { CardDeck } from './CardDeck.js'
import {eventQueue} from './ResolveCardPlay.js'

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
		deployCardFromHand(i : int, func : Callable)
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
	deployCardFromHand(i, func) {

		let card = this.hand[i]

		for (let cost of card.costs) {	
			if (cost.kind === "payMana") {
				if (this.mana < cost.amount) {
					return
				} else {
					this.mana -= cost.amount
				}
			}
			if (cost.kind === "payLife") {
				if (this.health < cost.amount) {
					return
				} else {
					this.health -= cost.amount
				}
			}
			if (cost.kind === "fizzleFriendlyNonPlayers") {
				// for now this cost will empty the hand
				if ((this.hand.length - 1 - i) < cost.amount) {
					return
				} else {
					this.hand.splice(i+1,cost.amount)
					this.hand = [...this.hand, ...this.deck.drawCards(cost.amount)]
				}
			}
		}

		this.played_card_i = i
		this.played_card = this.hand[i]
		
		/* deploy the card to the board */

		this.activeCards.push(card)

		/* if applicable, trigger this card's entry effect */

		eventQueue.push(  

			new TriggerCardEvent( card, "entry" ),
			new ReturnControlEvent()

		)

		/* TODO: we need to check if there are cards in play with a GREET trigger that needs
		to be triggered by this card */

		// remove card from hand and draw another

		this.hand.splice(i, 1)
		this.hand = [...this.hand, ...this.deck.drawCards(1)]

		// card play animation

		// a side effect of this function is it disables input to the game

		this.view.renderBoard()

		/* give control to the current player after animation plays */

	}

}