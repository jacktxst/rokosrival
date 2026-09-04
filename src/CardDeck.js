
/**
 	represents a deck of cards.
 */
export class CardDeck {

	constructor(cards){
		this.original = Array.from(cards)
		this.cards = Array.from(cards)
	}

	/** unimplemented, return a list of n cards off the top of the deck, and remove them from this.cards
		*/
	drawCards(n) {
		
	}

	/** unimplemented,  thoroughly shuffle this.cards */
	shuffleCards() {
		
	}

	/** return a deck to its original order. */
	unshuffleCards() {
		this.cards = Array.from(this.original)
	}

}