import { Card } from './Card.js'


export class CardLibrary {
	
	constructor() {

		this.cards = [

			new Card({
				name : "Card A",
				note : "10 damage to your opponent",
				cost : 20,
				damage : 8,
				onPlay() {
					this.opponent.health -= this.played_card.damage
				}
			}),

			new Card({
				name : "Card B",
				note : "absorb 10 hp of your opponents health",
				cost : 20,
				onPlay() {
					this.opponent.health -= 10
					this.health += 10
				}
			}),

			new Card({
				name : "Card C",
				cost : 5,
				note : "increase your defense in the next round. not implemented."
			}),

			new Card({
				name : "health potion",
				note : "heal 10 hp",
				cost : 10,
				onPlay() {
					this.health += 10
				}
			}),

			new Card({
				cost : 30,
				name : "poison",
				note : "this card does nothing"
			}),

			new Card({
				cost : 20,
				name : "Card F",
				note : "this card does nothing"
			}),

			new Card({
				cost : 20,
				name : "Card G",
				note : "this card does nothing"
			})
		]


	}

}