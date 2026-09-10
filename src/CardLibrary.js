import { CardBase } from './CardBase.js'


export class CardLibrary {
	
	constructor() {

		this.cards = [

			new CardBase({
				name : "Card A",
				note : "10 damage to your opponent",
				cost : 20,
				onPlay() {
					this.opponent.health -= 10
				}
			}),

			new CardBase({
				name : "Card B",
				note : "absorb 10 hp of your opponents health",
				cost : 20,
				onPlay() {
					this.opponent.health -= 10
					this.health += 10
				}
			}),

			new CardBase({
				name : "Card C",
				cost : 5,
				note : "increase your defense in the next round. not implemented."
			}),

			new CardBase({
				name : "health potion",
				note : "heal 10 hp",
				cost : 10,
				onPlay() {
					this.health += 10
				}
			}),

			new CardBase({
				cost : 30,
				name : "poison",
				note : "this card does nothing"
			}),

			new CardBase({
				cost : 20,
				name : "Card F",
				note : "this card does nothing"
			}),

			new CardBase({
				cost : 20,
				name : "Card G",
				note : "this card does nothing"
			})
		]


	}

}