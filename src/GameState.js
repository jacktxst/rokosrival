
import { CardLibrary } from './CardLibrary.js'


/*

	Holds the state of an entire 
	Roko's Rival game, not just 
	one match. This is the data 
	that will be saved and loaded 
	once that's implemented.

*/

export class GameState {

	constructor() {

		this.matchNumber = 0
		this.currentState = ""
		this.cardLibrary  = new CardLibrary()
		this.currentGameView = null
		this.playerDeck = this.cardLibrary.getRandomDeck(50)


	}
}

export let gameState = new GameState();