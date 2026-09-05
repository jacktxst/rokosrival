
/**
 	represents a deck of cards.
 */
export class CardDeck {

	constructor(cards){
		this.rrType = "CardDeck"
		this.original = Array.from(cards||[])
		this.cards = Array.from(cards||[])
	}

	/** unimplemented, return a list of n cards off the top of the deck, and remove them from this.cards
		*/
	drawCards(n) {
		let list = []
		for(let i=0;i<n;i++) {
			list.push(this.cards.pop())
		}
		return list
	}

	placeCards(cards) {

	}

	burnCards(cards) {

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