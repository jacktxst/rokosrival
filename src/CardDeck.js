
/**
 	represents a deck of cards.
 */
export class CardDeck {

	constructor(cards){
		this.rrType = "CardDeck"
		this.original = Array.from(cards||[])
		this.cards = Array.from(cards||[])
	}

	/** return a list of n cards and remove them from the deck */
	drawCards(n) {
		let list = []
		for(let i=0;i<n;i++) {
			if (this.cards.length === 0) break
			list.push(this.cards.pop())
		}
		return list
	}

	/** place cards on top of a deck */
	placeCards(cards) {
		this.cards = [...this.cards, ...cards]
	}

	/** place cards underneath a deck */
	burnCards(cards) {
		this.cards = [...cards, ...this.cards]
	}

	/** shuffle the cards */
	shuffleCards() {
		for (let i = this.cards.length - 1; i > 0; i--) {
		    const j = Math.floor(Math.random() * (i + 1));
		    [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	/** return a deck to its original order. */
	unshuffleCards() {
		this.cards = Array.from(this.original)
	}

}