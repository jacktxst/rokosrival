import { CardBase } from './CardBase.js'


export class CardLibrary {
	
	constructor() {

		this.cards = [

			new CardBase({
				name : "Card A"
			}),

			new CardBase({
				name : "Card B"
			}),

			new CardBase({
				name : "Card C"
			}),

			new CardBase({
				name : "Card D"
			}),

			new CardBase({
				name : "Card E"
			}),

			new CardBase({
				name : "Card F"
			}),

			new CardBase({
				name : "Card G"
			})
		]


	}

}