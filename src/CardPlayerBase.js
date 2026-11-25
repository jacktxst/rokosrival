/*

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/
import { DeployedCard } from './DeployedCard.js'
import { TriggerCardEvent, ReturnControlEvent, eventQueue } from './ResolveCardPlay.js'
import { CardDeck } from './CardDeck.js'

export class CardPlayerBase {

	constructor(args) {

		this.name        = args.name || "Default Name"
		this.deck        = args.deck || new CardDeck()
		this.discard     = args.discard || new CardDeck()
		this.cardGame    = args.game || null
		this.activeCards = []
		this.opponent = null
		this.type = { kind: "player" }

	}

	/** called by CardGame when the game begins */
	beginGame() {

		this.health = 100
		this.baseMana = 100
		this.shield = 0
		this.mana = this.baseMana
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
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
		let deployedCard = new DeployedCard(card, this)
		this.activeCards.push(deployedCard)

		/* if applicable, trigger this card's entry effect */

		eventQueue.push(  

			new TriggerCardEvent( deployedCard, "entry" ),
			

		)

		for (let card of [...this.activeCards, ...this.opponent.activeCards]) {
			if (card !== deployedCard) {
				eventQueue.push(new TriggerCardEvent( card, "greet", deployedCard ))
			}
		}

		eventQueue.push(
			new ReturnControlEvent()
		)

		
		// remove card from hand and draw another

		this.hand.splice(i, 1)
		this.hand = [...this.hand, ...this.deck.drawCards(1)]

		// card play animation

		// a side effect of this function is it disables input to the game

		this.view.renderBoard()

		// this.doTurn()

		/* give control to the current player after animation plays */

	}

	attack(attacker, damage) {
		if (this.shield !== 0) { // got a weird error message: cant read .shield from undefined
			if (this.shield < damage) {
				damage -= this.shield
				this.shield = 0
			} else {
				this.shield -= damage
				damage = 0
			}
		}
		this.health -= damage;
		for (let card of this.activeCards) {
			if (card.type.kind === "spell") {
				eventQueue.splice(1,0, new TriggerCardEvent(card, "thorn", attacker))
			}
		}
		if (this.health <= 0) {
			this.fizzle()
		}
	}

}