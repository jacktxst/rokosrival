
import { CardLibrary } from './CardLibrary.js'
import { CardDeck } from './CardDeck.js'
 

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
		this.currentGameView = null
		this.seed = 0 // TODO
		this.cardLibrary  = new CardLibrary(this.seed)
		this.playerDeck = new CardDeck( this.cardLibrary.getRandomDeck(50) )
	}

	loadSaveData() {
		const savedGame = localStorage.getItem("savedGame")
		if(savedGame) {
			const data = JSON.parse(savedGame)
			this.matchNumber = data.matchNumber
			this.currentState = data.currentState
			// Load other necessary properties as needed
		}
	}
	
	hasSavedGame() {
		return localStorage.getItem("savedGame") !== null
	}
}

export let gameState = new GameState();